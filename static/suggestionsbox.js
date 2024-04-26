document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('generateSuggestionsBtn').addEventListener('click', fetchSuggestions);
    console.log('Suggestions box ready for interactions.');
});

function fetchSuggestions() {
    const sessionId = getCurrentSessionId();  // Ensure this function retrieves the current session ID
    console.log('Fetching suggestions for session ID:', sessionId);

    const keypointsData = getCurrentSessionKeypoints(sessionId);
    if (!keypointsData) {
        console.error('Failed to retrieve keypoints data for session:', sessionId);
        updateSuggestionsBox('Error: Keypoints data is unavailable.');
        return;
    }

    console.log('Keypoints data retrieved:', keypointsData);
    const formattedData = formatDataForDisplay(keypointsData);
    updateSuggestionsBox(formattedData);

    // Simulate an API call to fetch suggestions based on keypoints
    setTimeout(() => {
        console.log('Suggestions processed.');
        updateSuggestionsBox('Here are the optimized suggestions based on the keypoints you have provided for user and reference videos.');
    }, 2000); // This timeout is just for simulation, replace it with your real API call
}

function formatDataForDisplay(keypointsData) {
    // Log the complete keypoints data for inspection
    console.log("Keypoints Data:", keypointsData);

    // Format user keypoints
    const userKeypoints = keypointsData.userKeypoints.flatMap(kpArray => 
        kpArray.map(kp => `User ${kp.keypoint}: X=${kp.x}, Y=${kp.y}`)
    );

    // Format reference keypoints
    const referenceKeypoints = keypointsData.referenceKeypoints.flatMap(kpArray => 
        kpArray.map(kp => `Reference ${kp.keypoint}: X=${kp.x}, Y=${kp.y}`)
    );

    // Combine all formatted strings, separated by commas for easier reading
    return [...userKeypoints, ...referenceKeypoints].join(", ");
}



function updateSuggestionsBox(message) {
    console.log('Updating suggestions box with message:', message);
    const suggestionsBox = document.getElementById('suggestionsContent');
    suggestionsBox.innerHTML = message;  // Use innerHTML to render HTML content
}

function getCurrentSessionId() {
    // This needs to correctly identify the current session ID from the global scope or a managing function
    return currentSessionId;  // Assuming 'currentSessionId' is maintained globally or in 'sidebar.js'
}