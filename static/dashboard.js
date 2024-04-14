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

// Event listener for video upload button
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
    const frameRate = 30; // assuming 30 fps, adjust as necessary for your videos
    const step = 1 / frameRate;
    scrubber.max = video.duration;
    scrubber.step = step.toFixed(5); // Ensuring the step is appropriately precise

    scrubber.oninput = function() {
        video.currentTime = parseFloat(this.value); // Setting the current time to the scrubber's value
    };
}

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
    preview.innerHTML = '';  // Clear any existing content
    preview.appendChild(img);  // Add the new image

    initCanvas(previewId, dropdownId);
}

function readURL(input, previewId, dropdownId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var img = document.createElement('img');
            img.src = e.target.result;

            var preview = document.getElementById(previewId);
            preview.innerHTML = '';  // Clear any existing content
            preview.appendChild(img);  // Add the new image
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

    canvas.addEventListener('mousedown', function(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        dragStarted = false;
        for (var label in points) {
            var point = points[label];
            if (x >= point[0] - 5 && x <= point[0] + 5 && y >= point[1] - 5 && y <= point[1] + 5) {
                dragObject = point;
                dragStarted = true;
                return;
            }
        }
        if (!dragStarted && !points[dropdown.value]) {
            points[dropdown.value] = [x, y];
            redrawAllPoints();
            updateDropdown();
            displayCoordinates(points);
        }
    });

    canvas.addEventListener('mousemove', function(e) {
        if (dragObject) {
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            dragObject[0] = x;
            dragObject[1] = y;
            redrawAllPoints();
        }
    });

    canvas.addEventListener('mouseup', function(e) {
        dragObject = null;
        if (dragStarted) {
            displayCoordinates(points);
            dragStarted = false; // Reset the flag after the drag is completed
        }
    });

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
            // If all points are placed, show alert message
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
