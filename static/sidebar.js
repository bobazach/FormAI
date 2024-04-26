document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('newSessionBtn').addEventListener('click', createNewSession);
    createNewSession();  // Initialize the first session
});

let currentSessionId = 0;
let sessions = {};
const originalTemplate = document.querySelector('.session-template').cloneNode(true);  // Save a pristine copy of the template
const keypoints = [
    "Nose", "Left Eye", "Right Eye", "Left Ear", "Right Ear",
    "Left Shoulder", "Right Shoulder", "Left Elbow", "Right Elbow",
    "Left Wrist", "Right Wrist", "Left Hip", "Right Hip",
    "Left Knee", "Right Knee", "Left Ankle", "Right Ankle"
];

function createNewSession() {
    currentSessionId++;
    const sessionId = currentSessionId;
    const sessionTab = document.createElement('li');
    sessionTab.textContent = 'Session #' + sessionId;
    sessionTab.onclick = () => switchSession(sessionId);
    document.getElementById('sessionList').appendChild(sessionTab);

    const sessionTemplate = originalTemplate.cloneNode(true);
    sessionTemplate.style.display = 'block'; // Ensure it's visible
    sessionTemplate.id = 'session' + sessionId;
    document.getElementById('currentSession').appendChild(sessionTemplate);

    resetSessionTemplate(sessionTemplate);  // Reset the template to its default state

    sessions[sessionId] = {
        tab: sessionTab,
        content: sessionTemplate,
        videoElements: sessionTemplate.querySelectorAll('video'),
        keypointsDataUser: [],
        keypointsIndexUser: 0,
        keypointsDataReference: [],
        keypointsIndexReference: 0
    };

    initSessionControls(sessionTemplate, sessionId);
    setupVideoControls(sessionTemplate);  // Setup drag and zoom for this specific session

    if (currentSessionId === 1) {
        switchSession(sessionId);  // Automatically switch to the first session created
    }
}

function setupVideoControls(sessionTemplate) {
    // Apply the drag and zoom functionality to both user and reference videos within the session
    const userVideo = sessionTemplate.querySelector('.userVideoPreview');
    const userZoomSlider = sessionTemplate.querySelector('.user-side .zoom-slider');
    const referenceVideo = sessionTemplate.querySelector('.referenceVideoPreview');
    const referenceZoomSlider = sessionTemplate.querySelector('.reference-side .zoom-slider');
    
    if (userVideo && userZoomSlider) {
        initDragAndZoom(userVideo, userZoomSlider);
    }
    if (referenceVideo && referenceZoomSlider) {
        initDragAndZoom(referenceVideo, referenceZoomSlider);
    }
}

function initDragAndZoom(video, zoomSlider) {
    let startPos = { x: 0, y: 0 };
    let currentScale = 1;  // Initial scale factor
    let offsetX = 0, offsetY = 0;  // Keep track of cumulative offsets

    const mouseDownHandler = function(e) {
        e.preventDefault();
        startPos = {
            x: e.clientX,
            y: e.clientY
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', function() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            video.style.cursor = 'grab';
        });
        video.style.cursor = 'grabbing';
    };

    const mouseMoveHandler = function(e) {
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        offsetX += dx;
        offsetY += dy;
        startPos = { x: e.clientX, y: e.clientY }; // Update start position for next move
        applyTransform(video, currentScale, offsetX, offsetY);
    };

    video.addEventListener('mousedown', mouseDownHandler);

    zoomSlider.addEventListener('input', function() {
        currentScale = parseFloat(this.value);
        applyTransform(video, currentScale, offsetX, offsetY);
    });
}

function applyTransform(video, scale, x, y) {
    video.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    video.style.transformOrigin = 'center center'; // Ensure scaling occurs from the center
}


function applyTransform(video, scale, x, y) {
    video.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}


function resetSessionTemplate(template) {
    const videos = template.querySelectorAll('video');
    videos.forEach(video => {
        video.removeAttribute('src');
        video.load();
    });
    const inputs = template.querySelectorAll('input[type="file"]');
    inputs.forEach(input => input.value = '');
}

function switchSession(sessionId) {
    Object.values(sessions).forEach(session => {
        session.content.style.display = 'none';
        session.tab.classList.remove('active');
    });
    const session = sessions[sessionId];
    session.content.style.display = 'block';
    session.tab.classList.add('active');
}

function initSessionControls(container, sessionId) {
    const videoFileInputs = container.querySelectorAll('input[type="file"]');
    const uploadButtons = container.querySelectorAll('.upload-button');
    const playPauseButtons = container.querySelectorAll('.playPauseUserBtn, .playPauseReferenceBtn');
    const frameScrubbers = container.querySelectorAll('.frameScrubberUser, .frameScrubberReference');
    const captureFrameButtons = container.querySelectorAll('.captureFrameUser, .captureFrameReference');

    uploadButtons.forEach((button, index) => {
        button.addEventListener('click', () => videoFileInputs[index].click());
    });

    videoFileInputs.forEach((input, index) => {
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            const videoElement = sessions[sessionId].videoElements[index];
            loadVideo(file, videoElement, container);
        });
    });

    playPauseButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            togglePlayPause(sessions[sessionId].videoElements[index], button);
        });
    });

    frameScrubbers.forEach((scrubber, index) => {
        scrubber.addEventListener('input', () => {
            adjustVideoFrame(sessions[sessionId].videoElements[index], scrubber);
        });
    });

    captureFrameButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            captureFrameToCanvas(sessions[sessionId].videoElements[index], container.querySelectorAll('canvas')[index], sessionId, index === 0);
        });
    });
}

function loadVideo(file, videoElement, container) {
    if (file) {
        const url = URL.createObjectURL(file);
        videoElement.src = url;
        videoElement.hidden = false;
        videoElement.onloadedmetadata = () => {
            enableVideoControls(videoElement);
            const userZoomSlider = container.querySelector('.user-side .zoom-slider');
            const referenceZoomSlider = container.querySelector('.reference-side .zoom-slider');

            userZoomSlider.style.display = 'block';
            referenceZoomSlider.style.display = 'block';

        };
    }
}

function enableVideoControls(videoElement) {
    const playPauseButton = videoElement.parentNode.parentNode.querySelector('.playPauseUserBtn, .playPauseReferenceBtn');
    const frameScrubber = videoElement.parentNode.parentNode.querySelector('.frameScrubberUser, .frameScrubberReference');
    const captureFrameButton = videoElement.parentNode.parentNode.querySelector('.captureFrameUser, .captureFrameReference');

    playPauseButton.style.display = 'block';
    frameScrubber.style.display = 'block';
    frameScrubber.max = Math.floor(videoElement.duration * 30); // Assuming 30 fps
    frameScrubber.value = 0;
    captureFrameButton.style.display = 'block';
}

function togglePlayPause(videoElement, button) {
    if (videoElement.paused) {
        videoElement.play();
        button.textContent = 'Pause';
    } else {
        videoElement.pause();
        button.textContent = 'Play';
    }
}

function adjustVideoFrame(videoElement, scrubber) {
    videoElement.currentTime = scrubber.value / 30; // Assuming 30 fps
}

function captureFrameToCanvas(videoElement, canvas, sessionId, isUserSide) {
    const ctx = canvas.getContext('2d');
    const transform = new WebKitCSSMatrix(getComputedStyle(videoElement).transform);
    const scaleAdjustmentFactor = 296 / Math.max(videoElement.videoWidth, videoElement.videoHeight);
    const scale = transform.a * scaleAdjustmentFactor;
    const xOffset = transform.m41;
    const yOffset = transform.m42;
    const scaledWidth = videoElement.videoWidth * scale;
    const scaledHeight = videoElement.videoHeight * scale;
    const centeredX = (canvas.width - scaledWidth) / 2 + xOffset;
    const centeredY = (canvas.height - scaledHeight) / 2 + yOffset;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centeredX + scaledWidth / 2, centeredY + scaledHeight / 2);
    ctx.drawImage(videoElement, -videoElement.videoWidth / 2 * scale, -videoElement.videoHeight / 2 * scale, scaledWidth, scaledHeight);
    ctx.restore();
    canvas.hidden = false;

    switchToKeypointsMode(canvas.parentNode, sessionId, isUserSide);
}


function switchToKeypointsMode(container, sessionId, isUserSide) {
    const canvas = container.querySelector('canvas');
    canvas.style.display = 'block';
    
    if (!sessions[sessionId].clickHandler) {
        sessions[sessionId].clickHandler = function(e) {
            handleCanvasClick(e, sessionId, isUserSide);
        };
    }
    canvas.addEventListener('click', sessions[sessionId].clickHandler);

    // Hide video controls
    const videoControls = container.querySelectorAll('.playPauseUserBtn, .playPauseReferenceBtn, .frameScrubberUser, .frameScrubberReference, .zoom-slider, .captureFrameUser, .captureFrameReference');
    videoControls.forEach(control => control.style.display = 'none');
    const controls = container.querySelectorAll('.controls, .video-wrapper, .upload-button');
    controls.forEach(control => control.style.display = 'none');
    const keypointsButton = container.querySelector('.keypointsBtn');
    if (keypointsButton) {
        keypointsButton.style.display = 'none';  // Optionally hide keypoints mode button if it should not be used again
    }
}



function handleCanvasClick(event, sessionId, isUserSide) {
    const session = sessions[sessionId];
    const keypointData = isUserSide ? session.keypointsDataUser : session.keypointsDataReference;
    const keypointsIndex = isUserSide ? session.keypointsIndexUser : session.keypointsIndexReference;
    const canvas = isUserSide ? session.content.querySelector('.userCanvas') : session.content.querySelector('.referenceCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;


    if (keypointsIndex < (keypoints.length)) {
        console.log("Keypoint:", keypointsIndex, x, y);
        console.log("Keypoints:", keypoints.length);
        const keypointName = keypoints[keypointsIndex];
        drawKeypoint(ctx, x, y, keypointName);
        keypointData.push({ x: x, y: y });

        isUserSide ? session.keypointsIndexUser++ : session.keypointsIndexReference++;

        if ((isUserSide ? session.keypointsIndexUser : session.keypointsIndexReference) === keypoints.length) {
            console.log("All keypoints placed");
            const saveButton = isUserSide ? session.content.querySelector('.user-side .saveKeypointsBtn') : session.content.querySelector('.reference-side .saveKeypointsBtn');
            showSaveButton(saveButton, keypointData, sessionId, isUserSide);
        }
    }
}

function drawKeypoint(ctx, x, y, keypoint) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.font = "12px Arial";
    ctx.fillText(keypoint, x + 7, y -7 );
}

function showSaveButton(button, keypointData, sessionId, isUserSide) {
    button.style.display = 'block';
    button.onclick = function() {
        button.style.display = 'none';
        saveKeypoints(button.parentNode, keypointData, sessionId, isUserSide);
    };
}

function saveKeypoints(container, keypointData, sessionId, isUserSide) {
    // Assuming a more complex structure might be used or sending this data to a server.
    console.log("Keypoints saved:", keypointData);
    const canvas = isUserSide ? container.querySelector('.userCanvas') : container.querySelector('.referenceCanvas');
    if (sessions[sessionId].clickHandler) {
        canvas.removeEventListener('click', sessions[sessionId].clickHandler);
        delete sessions[sessionId].clickHandler;  // Optional: Remove the handler reference if no longer needed
    }

    alert('Keypoints saved!');
    exitKeypointsMode(container, sessionId, isUserSide);  // Switch back to video controls
}

function exitKeypointsMode(container, sessionId, isUserSide) {
    // Re-enable the video controls
    const videoControls = container.querySelectorAll('.playPauseUserBtn, .playPauseReferenceBtn, .frameScrubberUser, .frameScrubberReference, .zoom-slider, .captureFrameUser, .captureFrameReference');
    videoControls.forEach(control => control.style.display = 'block');

    const controls = container.querySelectorAll('.controls, .video-wrapper, .upload-button');
    controls.forEach(control => control.style.display = 'block');

    // Ensure the canvas is hidden after leaving keypoints mode
    const userCanvas = container.querySelector('.userCanvas');
    const referenceCanvas = container.querySelector('.referenceCanvas');
    if (userCanvas) {
        userCanvas.style.display = 'none';
    }
    if (referenceCanvas) {
        referenceCanvas.style.display = 'none';
    }

    console.log(isUserSide ? "User side" : "Reference side", "exited keypoints mode");
    // Resetting the keypoints index to allow for new keypoints to be added in future
    if (isUserSide) {
        sessions[sessionId].keypointsIndexUser = 0;
        sessions[sessionId].keypointsDataUser = [];
    } else {
        sessions[sessionId].keypointsIndexReference = 0;
        sessions[sessionId].keypointsDataReference = [];
    }
}


