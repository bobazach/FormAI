function fetchSuggestions(sessionId) {
    console.log('Fetching suggestions for session ID:', sessionId);

    const keypointsData = getCurrentSessionKeypoints(sessionId);
    if (!keypointsData) {
        console.error('Failed to retrieve keypoints data for session:', sessionId);
        updateSuggestionsBox('Error: Keypoints data is unavailable.', sessionId);
        return;
    }

    console.log('Keypoints data retrieved:', keypointsData);
    const formattedData = formatDataForDisplay(keypointsData);
    console.log('Formatted data:', formattedData);
    updateSuggestionsBox('Fetching suggestions... Please wait.', sessionId);

    fetch('/get-suggestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({formattedData})
    }).then(response => response.json())
      .then(data => {
          console.log('Suggestions received:', data.suggestions);
          updateSuggestionsBox(data.suggestions, sessionId);
      })
      .catch(error => {
          console.error('Error fetching suggestions:', error);
          updateSuggestionsBox('Failed to fetch suggestions.', sessionId);
      });
}

function updateSuggestionsBox(message, sessionId) {
    console.log('Updating suggestions box with message:', message);
    const suggestionsBox = sessions[sessionId].suggestionsBox;
    suggestionsBox.innerHTML = message;
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




