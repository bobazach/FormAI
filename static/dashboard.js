function readURL(input, previewId, dropdownId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';  // Ensure the image fits the container
            img.style.height = 'auto';

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
    var points = {}; // Stores {label: [x, y]}
    var labels = ["nose", "leftEye", "rightEye", "leftEar", "rightEar",
                  "leftShoulder", "rightShoulder", "leftElbow", "rightElbow",
                  "leftWrist", "rightWrist", "leftHip", "rightHip",
                  "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"];
    var dropdown = document.getElementById(dropdownId);
    
    // Clear existing options in the dropdown to avoid duplication
    while (dropdown.options.length > 0) {
        dropdown.remove(0);
    }

    labels.forEach(function(label) {
        var option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        dropdown.appendChild(option);
    });

    var dragObject = null;

    canvas.addEventListener('mousedown', function(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        // Check if we are on a point
        for (var label in points) {
            var point = points[label];
            if (x >= point[0] - 5 && x <= point[0] + 5 && y >= point[1] - 5 && y <= point[1] + 5) {
                dragObject = point;
                return;
            }
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
        displayCoordinates(points);
    });

    canvas.addEventListener('click', function(e) {
        if (!dragObject && !points[dropdown.value]) {
            placePoint(e);
        }
    });

    function placePoint(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        points[dropdown.value] = [x, y];
        redrawAllPoints();
        updateDropdown(dropdown.selectedIndex);
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

    function updateDropdown(currentIndex) {
        var found = false;
        for (let i = 1; i <= labels.length; i++) {
            var nextIndex = (currentIndex + i) % labels.length;
            if (!points[dropdown.options[nextIndex].value]) {
                dropdown.selectedIndex = nextIndex;
                found = true;
                break;
            }
        }
        if (!found) {
            alert('All points are placed. You can now drag them to adjust their positions.');
        }
    }

    function displayCoordinates(points) {
        var display = document.getElementById('coordsDisplay');
        display.textContent = JSON.stringify(points, null, 2);
    }
}

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
