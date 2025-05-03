document.addEventListener('DOMContentLoaded', function() {
    const chatInputField = document.querySelector('.chat-input-field');
    const chatSendButton = document.querySelector('.chat-send-button');
    const chatGrid = document.querySelector('.chat-grid');

    // WebSocket connection setup
    const urlParts = window.location.pathname.split('/');
    const roomId = urlParts[urlParts.length - 2];
    const chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/' + roomId + '/');

    // Enable the Send button when there's text input
    chatInputField.addEventListener('input', function() {
        chatSendButton.disabled = !chatInputField.value.trim();
    });

    // When WebSocket is connected
    chatSocket.onopen = function() {
        console.log('Connected to WebSocket');
    };

    // When WebSocket receives a message
    chatSocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const message = data.message;

        // Create a new chat message element
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', 'chat-left');
        messageElement.innerHTML = `
            <div class="chat-avatar"></div>
            <div class="chat-message-content">
                <div class="chat-message-header">
                    <span class="chat-name">User</span>
                    <span class="chat-timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="chat-message-text">${message}</div>
            </div>
        `;
        chatGrid.appendChild(messageElement);

        // Scroll to the bottom of the chat
        chatGrid.scrollTop = mainContent.scrollHeight;
    };

    // When WebSocket is closed
    chatSocket.onclose = function(event) {
        console.log('WebSocket connection closed', event);
    };

    // When an error occurs in WebSocket
    chatSocket.onerror = function(error) {
        console.error('WebSocket Error:', error);
    };

    // Handle Send button click
    chatSendButton.addEventListener('click', function() {
        const message = chatInputField.value.trim();
        if (message) {
            // Send message via WebSocket
            if (chatSocket.readyState === WebSocket.OPEN) {
                chatSocket.send(JSON.stringify({
                    'message': message
                }));
            } else {
                console.error('WebSocket is not open. Message not sent.');
            }
            chatInputField.value = '';  // Clear the input field
            chatSendButton.disabled = true;  // Disable the send button until there's new input

            // Add the message to the chat as a right-aligned message
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', 'chat-right');
            messageElement.innerHTML = `
                <div class="chat-avatar"></div>
                <div class="chat-message-content">
                    <div class="chat-message-header">
                        <span class="chat-name">You</span>
                        <span class="chat-timestamp">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <div class="chat-message-text">${message}</div>
                </div>
            `;
            chatGrid.appendChild(messageElement);

            chatGrid.scrollTop = mainContent.scrollHeight;
        }
    });

    // Handle Enter key press in the input field
    chatInputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && chatInputField.value.trim()) {
            chatSendButton.click(); // Trigger the Send button click
            event.preventDefault(); // Prevent default form submission behavior
        }
    });
});