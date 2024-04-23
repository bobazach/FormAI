document.getElementById('uploadUserVideoButton').addEventListener('click', () => {
    document.getElementById('userVideoFileInput').click();
});

document.getElementById('userVideoFileInput').addEventListener('change', event => {
    const file = event.target.files[0];
    const videoElement = document.getElementById('userVideoPreview');
    videoElement.src = URL.createObjectURL(file);
    videoElement.hidden = false;
    videoElement.onloadedmetadata = () => {
        setupScrubber(videoElement.duration);
        document.getElementById('frameScrubberUser').style.display = 'block';
        document.getElementById('captureFrameUser').style.display = 'block';
        document.getElementById('playPauseUserBtn').style.display = 'block';
    };
});

function setupScrubber(duration) {
    const scrubber = document.getElementById('frameScrubberUser');
    const frameRate = 30; // Assuming 30 fps
    scrubber.max = duration * frameRate;
    scrubber.step = 1 / frameRate;
    scrubber.addEventListener('input', () => {
        const video = document.getElementById('userVideoPreview');
        video.currentTime = scrubber.value / frameRate;
    });
}

document.getElementById('captureFrameUser').addEventListener('click', () => {
    captureFrame();
    hideVideoControls();
});

function captureFrame() {
    const video = document.getElementById('userVideoPreview');
    const canvas = document.getElementById('userCanvas');
    const ctx = canvas.getContext('2d');
    const aspectRatio = video.videoWidth / video.videoHeight;
    let newWidth = canvas.width;
    let newHeight = newWidth / aspectRatio;
    if (newHeight > canvas.height) {
        newHeight = canvas.height;
        newWidth = newHeight * aspectRatio;
    }
    const xOffset = (canvas.width - newWidth) / 2;
    const yOffset = (canvas.height - newHeight) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, xOffset, yOffset, newWidth, newHeight);
    canvas.hidden = false;

    // Unhide the Edit Image button and keypoints dropdown
    document.getElementById('editImageBtn').hidden = false;
    document.getElementById('keypointsBtn').hidden = false;
    document.getElementById('keypointType').hidden = false;
}

function hideVideoControls() {
    document.getElementById('userVideoPreview').hidden = true;
    document.getElementById('frameScrubberUser').style.display = 'none';
    document.getElementById('captureFrameUser').style.display = 'none';
    document.getElementById('playPauseUserBtn').style.display = 'none';
}

document.getElementById('editImageBtn').addEventListener('click', () => {
    activateImageEditing();
});

let dragging = false;
let lastX = 0;
let lastY = 0;
let translateX = 0;
let translateY = 0;
let scale = 1;

function activateImageEditing() {
    const canvas = document.getElementById('userCanvas');
    canvas.style.cursor = 'grab';

    canvas.onmousedown = function(e) {
        dragging = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
        canvas.style.cursor = 'grabbing';
    };

    canvas.onmouseup = function(e) {
        dragging = false;
        canvas.style.cursor = 'grab';
    };

    canvas.onmouseout = canvas.onmouseup;

    canvas.onmousemove = function(e) {
        if (dragging) {
            const dx = e.offsetX - lastX;
            const dy = e.offsetY - lastY;
            lastX = e.offsetX;
            lastY = e.offsetY;
            translateX += dx;
            translateY += dy;
            redrawCanvas();
        }
    };

    canvas.onwheel = function(e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const factor = Math.pow(1 + zoomIntensity, -e.deltaY * 0.01);
        scale *= factor;
        redrawCanvas();
    };
}

function redrawCanvas() {
    const canvas = document.getElementById('userCanvas');
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('userVideoPreview');
    const aspectRatio = video.videoWidth / video.videoHeight;
    let newWidth = canvas.width * scale;
    let newHeight = newWidth / aspectRatio;
    if (newHeight > canvas.height * scale) {
        newHeight = canvas.height * scale;
        newWidth = newHeight * aspectRatio;
    }
    const xOffset = (canvas.width - newWidth) / 2 + translateX;
    const yOffset = (canvas.height - newHeight) / 2 + translateY;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, xOffset, yOffset, newWidth, newHeight);
}


document.getElementById('keypointsBtn').addEventListener('click', () => {
    initializeKeypointMode();
});

let keypoints = {};
let allKeypointTypes = ["nose", "leftEye", "rightEye", "leftEar", "rightEar",
                  "leftShoulder", "rightShoulder", "leftElbow", "rightElbow",
                  "leftWrist", "rightWrist", "leftHip", "rightHip",
                  "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"];

function initializeKeypointMode() {
    const canvas = document.getElementById('userCanvas');
    deactivateImageEditing();
    canvas.style.cursor = 'crosshair';
    canvas.addEventListener('click', placeKeypoint);
}

function placeKeypoint(event) {
    const canvas = document.getElementById('userCanvas');
    const ctx = canvas.getContext('2d');
    const dropdown = document.getElementById('keypointType');
    const type = dropdown.value;
    if (!keypoints[type]) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(event.offsetX, event.offsetY, 3, 0, 2 * Math.PI);  // Smaller dot
        ctx.fill();
        ctx.font = "12px Arial";
        ctx.fillText(type, event.offsetX + 5, event.offsetY - 5); // Label next to the dot

        keypoints[type] = { x: event.offsetX, y: event.offsetY };
        updateDropdown(dropdown);
        checkAllKeypointsPlaced();
    } else {
        alert('Keypoint for ' + type + ' already placed.');
    }
}

function updateDropdown(dropdown) {
    let currentIndex = dropdown.selectedIndex;
    if (currentIndex < dropdown.options.length - 1) {
        dropdown.selectedIndex = currentIndex + 1;
    }
}

function checkAllKeypointsPlaced() {
    if (Object.keys(keypoints).length === allKeypointTypes.length) {
        alert('All keypoints have been placed.');
    }
}

function deactivateImageEditing() {
    const canvas = document.getElementById('userCanvas');
    canvas.onmousedown = null;
    canvas.onmouseup = null;
    canvas.onmousemove = null;
    canvas.onwheel = null;
    canvas.style.cursor = 'default';
}

function checkAllKeypointsPlaced() {
    if (Object.keys(keypoints).length === allKeypointTypes.length) {
        document.getElementById('saveKeypointsBtn').hidden = false;
        alert('All keypoints have been placed.');
    }
}

function saveKeypoints() {
    console.log('Keypoints saved:', keypoints);
    localStorage.setItem('keypointsData', JSON.stringify(keypoints));
    alert('Keypoints saved successfully!');
    resetApplication();
}

function resetApplication() {
    const canvas = document.getElementById('userCanvas');
    canvas.hidden = true;
    document.getElementById('saveKeypointsBtn').hidden = true;
    document.getElementById('keypointsBtn').hidden = true;

    // Re-enable video controls instead of hiding them
    document.getElementById('userVideoPreview').hidden = false;
    document.getElementById('frameScrubberUser').style.display = 'block';
    document.getElementById('captureFrameUser').style.display = 'block';
    document.getElementById('playPauseUserBtn').style.display = 'block';
    document.getElementById('editImageBtn').hidden = true;
    document.getElementById('keypointsBtn').hidden = true;
    document.getElementById('keypointType').hidden = true;

    keypoints = {};  // Reset keypoints
    // No need to hide the upload button as we're not prompting for a new upload
}
function deactivateImageEditing() {
    const canvas = document.getElementById('userCanvas');
    canvas.onmousedown = null;
    canvas.onmouseup = null;
    canvas.onmousemove = null;
    canvas.onwheel = null;
    canvas.style.cursor = 'default';
}

// Event listener for uploading reference video
document.getElementById('uploadReferenceVideoButton').addEventListener('click', () => {
    document.getElementById('referenceVideoFileInput').click();
});

// Handle video file change for reference video
document.getElementById('referenceVideoFileInput').addEventListener('change', event => {
    const file = event.target.files[0];
    const videoElement = document.getElementById('referenceVideoPreview');
    videoElement.src = URL.createObjectURL(file);
    videoElement.hidden = false;
    videoElement.onloadedmetadata = () => {
        setupScrubberReference(videoElement.duration);
        document.getElementById('frameScrubberReference').style.display = 'block';
        document.getElementById('captureFrameReference').style.display = 'block';
        document.getElementById('playPauseReferenceBtn').style.display = 'block';
    };
});

// Setup scrubber for reference video
function setupScrubberReference(duration) {
    const scrubber = document.getElementById('frameScrubberReference');
    const frameRate = 30; // Assuming 30 fps for simplicity
    scrubber.max = duration * frameRate;
    scrubber.addEventListener('input', () => {
        const video = document.getElementById('referenceVideoPreview');
        video.currentTime = scrubber.value / frameRate;
    });
}

// Capture frame for reference video
document.getElementById('captureFrameReference').addEventListener('click', () => {
    captureFrameReference();
    hideVideoControlsReference();
});

function captureFrameReference() {
    const video = document.getElementById('referenceVideoPreview');
    const canvas = document.getElementById('referenceCanvas');
    const ctx = canvas.getContext('2d');
    const aspectRatio = video.videoWidth / video.videoHeight;
    let newWidth = canvas.width;
    let newHeight = newWidth / aspectRatio;
    if (newHeight > canvas.height) {
        newHeight = canvas.height;
        newWidth = newHeight * aspectRatio;
    }
    const xOffset = (canvas.width - newWidth) / 2;
    const yOffset = (canvas.height - newHeight) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, xOffset, yOffset, newWidth, newHeight);
    canvas.hidden = false;

    // Unhide the Edit Image button and keypoints dropdown for the reference side
    document.getElementById('editReferenceBtn').hidden = false;
    document.getElementById('keypointsReferenceBtn').hidden = false;
    document.getElementById('keypointReferenceType').hidden = false;
}

// Hide controls after capturing frame for reference video
function hideVideoControlsReference() {
    document.getElementById('referenceVideoPreview').hidden = true;
    document.getElementById('frameScrubberReference').style.display = 'none';
    document.getElementById('captureFrameReference').style.display = 'none';
    document.getElementById('playPauseReferenceBtn').style.display = 'none';
}

// Edit image for reference video
document.getElementById('editReferenceBtn').addEventListener('click', () => {
    activateImageEditingReference();
});

function activateImageEditingReference() {
    const canvas = document.getElementById('referenceCanvas');
    canvas.style.cursor = 'grab';
    canvas.onmousedown = function(e) {
        dragging = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
        canvas.style.cursor = 'grabbing';
    };
    canvas.onmouseup = function(e) {
        dragging = false;
        canvas.style.cursor = 'grab';
    };
    canvas.onmouseout = canvas.onmouseup;
    canvas.onmousemove = function(e) {
        if (dragging) {
            const dx = e.offsetX - lastX;
            const dy = e.offsetY - lastY;
            lastX = e.offsetX;
            lastY = e.offsetY;
            translateX += dx;
            translateY += dy;
            redrawCanvasReference();
        }
    };
    canvas.onwheel = function(e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const factor = Math.pow(1 + zoomIntensity, -e.deltaY * 0.01);
        scale *= factor;
        redrawCanvasReference();
    };
}

function redrawCanvasReference() {
    const canvas = document.getElementById('referenceCanvas');
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('referenceVideoPreview');
    const aspectRatio = video.videoWidth / video.videoHeight;
    let newWidth = canvas.width * scale;
    let newHeight = newWidth / aspectRatio;
    if (newHeight > canvas.height * scale) {
        newHeight = canvas.height * scale;
        newWidth = newHeight * aspectRatio;
    }
    const xOffset = (canvas.width - newWidth) / 2 + translateX;
    const yOffset = (canvas.height - newHeight) / 2 + translateY;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, xOffset, yOffset, newWidth, newHeight);
}

// Initialize keypoint placement mode for reference video
document.getElementById('keypointsReferenceBtn').addEventListener('click', () => {
    initializeKeypointModeReference();
});

function initializeKeypointModeReference() {
    const canvas = document.getElementById('referenceCanvas');
    deactivateImageEditingReference();
    canvas.style.cursor = 'crosshair';
    canvas.addEventListener('click', placeKeypointReference);
}

function placeKeypointReference(event) {
    const canvas = document.getElementById('referenceCanvas');
    const ctx = canvas.getContext('2d');
    const dropdown = document.getElementById('keypointReferenceType');
    const type = dropdown.value;
    if (!keypointsReference[type]) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(event.offsetX, event.offsetY, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.font = "12px Arial";
        ctx.fillText(type, event.offsetX + 5, event.offsetY - 5);

        keypointsReference[type] = { x: event.offsetX, y: event.offsetY };
        updateDropdownReference(dropdown);
        checkAllKeypointsPlacedReference();
    } else {
        alert('Keypoint for ' + type + ' already placed.');
    }
}

function updateDropdownReference(dropdown) {
    let currentIndex = dropdown.selectedIndex;
    if (currentIndex < dropdown.options.length - 1) {
        dropdown.selectedIndex = currentIndex + 1;
    }
}

function checkAllKeypointsPlacedReference() {
    if (Object.keys(keypointsReference).length === allKeypointTypes.length) {
        document.getElementById('saveKeypointsReferenceBtn').hidden = false;
        alert('All keypoints have been placed.');
    }
}

let keypointsReference = {};  // Initialize a separate keypoints storage for the reference side

// Save keypoints for reference video
document.getElementById('saveKeypointsReferenceBtn').addEventListener('click', () => {
    console.log('Keypoints saved for reference:', keypointsReference);
    localStorage.setItem('keypointsDataReference', JSON.stringify(keypointsReference));
    alert('Keypoints saved successfully for reference!');
    resetApplicationReference();
});

function resetApplicationReference() {
    const canvas = document.getElementById('referenceCanvas');
    canvas.hidden = true;
    document.getElementById('saveKeypointsReferenceBtn').hidden = true;
    document.getElementById('keypointsReferenceBtn').hidden = true;

    // Re-enable video controls instead of hiding them
    document.getElementById('referenceVideoPreview').hidden = false;
    document.getElementById('frameScrubberReference').style.display = 'block';
    document.getElementById('captureFrameReference').style.display = 'block';
    document.getElementById('playPauseReferenceBtn').style.display = 'block';
    document.getElementById('editReferenceBtn').hidden = true;
    document.getElementById('keypointsReferenceBtn').hidden = true;
    document.getElementById('keypointReferenceType').hidden = true;

    keypointsReference = {};  // Reset keypoints for the reference side
    // No need to hide the upload button as we're not prompting for a new upload
}
// Disable image editing for the reference canvas
function deactivateImageEditingReference() {
    const canvas = document.getElementById('referenceCanvas');
    canvas.onmousedown = null;
    canvas.onmouseup = null;
    canvas.onmousemove = null;
    canvas.onwheel = null;
    canvas.style.cursor = 'default';
}
