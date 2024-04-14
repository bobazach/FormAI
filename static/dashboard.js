// Event listeners for file inputs
document.getElementById('uploadUserButton').addEventListener('click', function() {
    document.getElementById('userFileInput').click();
});

document.getElementById('userFileInput').addEventListener('change', function() {
    readURL(this, 'userImagePreview', 'userDropdown');
});

document.getElementById('uploadReferenceButton').addEventListener('click', function() {
    document.getElementById('referenceFileInput').click();
});

document.getElementById('referenceFileInput').addEventListener('change', function() {
    readURL(this, 'referenceImagePreview', 'referenceDropdown');
});

document.getElementById('uploadVideoButton').addEventListener('click', function() {
    document.getElementById('videoFileInput').click();
});

document.getElementById('videoFileInput').addEventListener('change', function() {
    loadVideo(this);
});

function loadVideo(input) {
    if (input.files && input.files[0]) {
        var file = input.files[0];
        var url = URL.createObjectURL(file);
        
        var video = document.getElementById('videoPreview');
        video.src = url;
        video.style.display = 'block';
        
        var scrubber = document.getElementById('frameScrubber');
        scrubber.style.display = 'block';

        video.onloadedmetadata = function() {
            configureScrubber(video, scrubber);
        };
    }
}

function configureScrubber(video, scrubber) {
    const frameRate = 30; // assuming 30 fps
    const step = 1 / frameRate;
    scrubber.max = video.duration;
    scrubber.step = step.toFixed(5);

    scrubber.oninput = function() {
        video.currentTime = parseFloat(this.value);
    };
}

document.getElementById('playPauseBtn').addEventListener('click', function() {
    var video = document.getElementById('videoPreview');
    if (video.paused || video.ended) {
        video.play();
    } else {
        video.pause();
    }
});

document.getElementById('zoomSlider').addEventListener('input', function() {
    const zoomLevel = this.value;
    const imagePreview = document.getElementById('userImagePreview');
    const image = imagePreview.querySelector('img');
    if (image) {
        image.style.transform = `scale(${zoomLevel})` + (image.dataset.translate || "");
    }
});

// Capture frame and display in the same way as image previews
document.getElementById('captureFrame').addEventListener('click', function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var video = document.getElementById('videoPreview');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    var img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    
    initCanvasWithImage(img, 'userImagePreview', 'userDropdown');
});

function initCanvasWithImage(img, previewId, dropdownId) {
    var preview = document.getElementById(previewId);
    preview.innerHTML = '';
    preview.appendChild(img);

    initCanvas(previewId, dropdownId);
}

function readURL(input, previewId, dropdownId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var img = document.createElement('img');
            img.src = e.target.result;

            var preview = document.getElementById(previewId);
            preview.innerHTML = '';
            preview.appendChild(img);
            initCanvas(previewId, dropdownId);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function initCanvas(previewId, dropdownId) {
    var preview = document.getElementById(previewId);
    var canvas = document.createElement('canvas');
    canvas.width = preview.offsetWidth;
    canvas.height = preview.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    preview.appendChild(canvas);

    initKeyPoints(canvas, dropdownId);
}

var mode = "drag"; // Default to drag mode
document.getElementById('modeToggle').addEventListener('click', function() {
    mode = (mode === "drag" ? "keypoints" : "drag");
    this.textContent = `Switch to ${mode === "drag" ? "keypoints" : "drag"} mode`;
    var image = document.getElementById('userImagePreview').querySelector('img');
    if (image) {
        image.style.cursor = (mode === "drag" ? "move" : "crosshair");
    }
});

function initKeyPoints(canvas, dropdownId) {
    var ctx = canvas.getContext('2d');
    var points = {};
    var labels = ["nose", "leftEye", "rightEye", "leftEar", "rightEar",
                  "leftShoulder", "rightShoulder", "leftElbow", "rightElbow",
                  "leftWrist", "rightWrist", "leftHip", "rightHip",
                  "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"];
    var dropdown = document.getElementById(dropdownId);
    labels.forEach(function(label) {
        var option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        dropdown.appendChild(option);
    });

    var dragObject = null;
    var dragStarted = false;
    var initialX = 0, initialY = 0;
    var translateX = 0, translateY = 0;

    canvas.addEventListener('mousedown', function(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        if (mode === "drag") {
            initialX = x;
            initialY = y;
            dragStarted = true;
        } else {
            dragObject = findDraggablePoint(x, y, points);
            if (!dragObject && !points[dropdown.value]) {
                points[dropdown.value] = [x, y];
                redrawAllPoints();
                updateDropdown();
                displayCoordinates(points);
            } else {
                dragStarted = true;
            }
        }
    });

    canvas.addEventListener('mousemove', function(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        if (dragStarted) {
            if (mode === "drag" && dragObject == null) {
                translateX = x - initialX;
                translateY = y - initialY;
                var img = canvas.parentNode.querySelector('img');
                if (img) {
                    img.dataset.translate = ` translate(${translateX}px, ${translateY}px)`;
                    img.style.transform = img.style.transform.split('translate')[0] + img.dataset.translate;
                }
            } else if (mode === "keypoints" && dragObject) {
                dragObject[0] = x;
                dragObject[1] = y;
                redrawAllPoints();
            }
        }
    });

    canvas.addEventListener('mouseup', function() {
        dragStarted = false;
        dragObject = null;
    });

    function findDraggablePoint(x, y, points) {
        for (var label in points) {
            var point = points[label];
            if (Math.abs(x - point[0]) <= 5 && Math.abs(y - point[1]) <= 5) {
                return point;
            }
        }
        return null;
    }

function redrawAllPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas to remove old drawings
    for (var label in points) {
        var point = points[label];
        ctx.fillStyle = 'blue'; // Set the color of the dot
        ctx.beginPath(); // Start a new path for the dot
        ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI); // Draw a circle representing the dot
        ctx.fill(); // Fill the circle with the specified color
        ctx.fillText(label, point[0] + 10, point[1] + 3); // Optionally, label the dot
    }
}


    function updateDropdown() {
        var allPlaced = true;  // Assume all points are placed initially
        for (var i = 0; i < dropdown.options.length; i++) {
            if (!points[dropdown.options[i].value]) {
                dropdown.selectedIndex = i;
                allPlaced = false;  // Found an unplaced point, set flag to false
                break;
            }
        }
    
        if (allPlaced) {
            alert('All dots are placed. Please drag them to their appropriate spots.');
        }
    }

    function displayCoordinates(points) {
        var display = document.getElementById('coordsDisplay');
        var formattedPoints = {};
        for (var label in points) {
            var point = points[label];
            formattedPoints[label] = [
                parseFloat(point[0].toFixed(2)),
                parseFloat(point[1].toFixed(2))
            ];
        }
        display.textContent = JSON.stringify(formattedPoints, null, 2);
    }
}
