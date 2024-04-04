document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('buttonForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way

        var inputText = document.getElementById('buttonText').value.trim(); // Get the value from the input field and trim whitespace
        
        // Only proceed if the input is not empty
        if(inputText !== '') {
            var newButton = document.createElement('button');
            newButton.textContent = inputText; // Set the button text to the user input
            newButton.style.cssText = `
                background-color: rgb(132, 192, 255);
                border: none;
                padding: 10px 40px;
                text-align: center;
                display: block;
                font-size: 16px;
                cursor: pointer;
                border-radius: 5px;
                width: 100%;
                margin-top: 10px;
            `;

            // Append the new button to the list
            document.getElementById('button-list').appendChild(newButton);

            // Clear the input field after creating the button
            document.getElementById('buttonText').value = '';
        }
    });
});
