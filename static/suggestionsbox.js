

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
        body: JSON.stringify({keypoints: formattedData})  // Send structured data
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
    // Transform user and reference keypoints into structured objects
    const userKeypointsFormatted = keypointsData.userKeypoints.flatMap(kpArray =>
        kpArray.reduce((acc, kp) => {
            acc[kp.keypoint] = {x: kp.x, y: kp.y};
            return acc;
        }, {})
    );

    const referenceKeypointsFormatted = keypointsData.referenceKeypoints.flatMap(kpArray =>
        kpArray.reduce((acc, kp) => {
            acc[kp.keypoint] = {x: kp.x, y: kp.y};
            return acc;
        }, {})
    );

    // Return combined data as an object
    return {user: userKeypointsFormatted, reference: referenceKeypointsFormatted};
}
