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

document.getElementById('uploadUserVideoButton').addEventListener('click', function() {
    document.getElementById('userVideoFileInput').click();
});

document.getElementById('userVideoFileInput').addEventListener('change', function() {
    loadVideo(this, 'userVideoPreview', 'frameScrubberUser');
});

document.getElementById('uploadReferenceVideoButton').addEventListener('click', function() {
    document.getElementById('referenceVideoFileInput').click();
});

document.getElementById('referenceVideoFileInput').addEventListener('change', function() {
    loadVideo(this, 'referenceVideoPreview', 'frameScrubberReference');
});

document.getElementById('zoomSliderUser').addEventListener('input', function() {
    updateZoom('userImagePreview', this.value);
});

document.getElementById('zoomSliderReference').addEventListener('input', function() {
    updateZoom('referenceImagePreview', this.value);
});

function loadVideo(input, videoId, scrubberId) {
    if (input.files && input.files[0]) {
        var file = input.files[0];
        var url = URL.createObjectURL(file);
        
        var video = document.getElementById(videoId);
        video.src = url;
        video.style.display = 'block';
        
        var scrubber = document.getElementById(scrubberId);
        scrubber.style.display = 'block';

        video.onloadedmetadata = function() {
            configureScrubber(video, scrubber);
        };
    }
}

function updateZoom(previewId, zoomLevel) {
    const imagePreview = document.getElementById(previewId);
    const image = imagePreview.querySelector('img');
    if (image) {
        const translate = image.dataset.translate || "";
        image.style.transform = `scale(${zoomLevel})` + translate;
    }
}

function configureScrubber(video, scrubber) {
    const frameRate = 30;
    const step = 1 / frameRate;
    scrubber.max = video.duration;
    scrubber.step = step.toFixed(5);

    scrubber.oninput = function() {
        video.currentTime = parseFloat(this.value);
    };
}

document.getElementById('playPauseUserBtn').addEventListener('click', function() {
    var video = document.getElementById('userVideoPreview');
    togglePlayPause(video);
});

document.getElementById('playPauseReferenceBtn').addEventListener('click', function() {
    var video = document.getElementById('referenceVideoPreview');
    togglePlayPause(video);
});

function togglePlayPause(video) {
    if (video.paused || video.ended) {
        video.play();
    } else {
        video.pause();
    }
}

document.getElementById('captureFrameUser').addEventListener('click', function() {
    captureFrame('userVideoPreview', 'userImagePreview', 'userDropdown');
});

document.getElementById('captureFrameReference').addEventListener('click', function() {
    captureFrame('referenceVideoPreview', 'referenceImagePreview', 'referenceDropdown');
});

function captureFrame(videoId, previewId, dropdownId) {
    var video = document.getElementById(videoId);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    var img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');

    initCanvasWithImage(img, previewId, dropdownId);
}

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

function initKeyPoints(canvas, dropdownId) {
    // Previously defined code with modifications for dot switching
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

    // Dot placement and updating dropdown to switch to next unplaced dot
    canvas.addEventListener('mousedown', function(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        if (mode === "drag") {
            dragStart(e, x, y); // Define function for starting drag
        } else {
            placeOrDragKeypoint(e, x, y, points, ctx, dropdown); // Define function for placing or dragging keypoints
        }
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
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        for (var label in points) {
            var point = points[label];
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillText(label, point[0] + 10, point[1] + 3);
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

var mode = "drag"; // Default to drag mode
document.getElementById('modeToggleUser').addEventListener('click', function() {
    mode = (mode === "drag" ? "keypoints" : "drag");
    this.textContent = `Switch to ${mode === "drag" ? "keypoints" : "drag"} mode`;
    var image = document.getElementById('userImagePreview').querySelector('img');
    if (image) {
        image.style.cursor = (mode === "drag" ? "move" : "crosshair");
    }
});

document.getElementById('modeToggleReference').addEventListener('click', function() {
    mode = (mode === "drag" ? "keypoints" : "drag");
    this.textContent = `Switch to ${mode === "drag" ? "keypoints" : "drag"} mode`;
    var image = document.getElementById('referenceImagePreview').querySelector('img');
    if (image) {
        image.style.cursor = (mode === "drag" ? "move" : "crosshair");
    }
});
