document.getElementById('newSessionBtn').addEventListener('click', () => {
    createNewSession();
});

let currentSessionId = 0;
let sessions = {};

function createNewSession() {
    const sessionId = ++currentSessionId;  // Increment and assign a new session ID
    const sessionTab = document.createElement('li');
    sessionTab.textContent = 'Session #' + sessionId;
    sessionTab.id = 'session' + sessionId;
    sessionTab.onclick = () => switchSession(sessionId);
    document.getElementById('sessionList').appendChild(sessionTab);

    // Prepare a new analysis environment
    const analysisContainer = document.createElement('div');
    analysisContainer.id = 'analysis' + sessionId;
    analysisContainer.style.display = 'none';  // Hide by default, shown when active
    document.getElementById('currentSession').appendChild(analysisContainer);

    // Store the session info
    sessions[sessionId] = {
        tab: sessionTab,
        content: analysisContainer
    };

    // Automatically switch to new session
    switchSession(sessionId);
}

function switchSession(sessionId) {
    // Hide all sessions and show the selected one
    for (let id in sessions) {
        sessions[id].content.style.display = 'none';
        sessions[id].tab.classList.remove('active');
    }
    sessions[sessionId].content.style.display = 'block';
    sessions[sessionId].tab.classList.add('active');
}

// Initial setup: start with one session
createNewSession();
