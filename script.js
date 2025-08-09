document.getElementById('send-button').addEventListener('click', function() {
    const messageInput = document.querySelector('#chat-input input[type="text"]');
    const message = messageInput.value;
    if (message.trim() !== '') {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.backgroundColor = '#f5f5dc';
        messageElement.style.padding = '10px';
        messageElement.style.margin = '5px 0';
        messageElement.style.borderRadius = '5px';
        document.getElementById('chat-messages').appendChild(messageElement);
        messageInput.value = '';
    }
});
