
        document.addEventListener('DOMContentLoaded', function() {
            // Generate or retrieve user ID
            let userId = localStorage.getItem('anonymousUserId');
            if (!userId) {
                userId = 'User' + Math.floor(Math.random() * 10000);
                localStorage.setItem('anonymousUserId', userId);
            }
            document.getElementById('user-id').textContent = userId;
            
            // Get DOM elements
            const chatMessages = document.getElementById('chat-messages');
            const messageInput = document.getElementById('message-input');
            const sendButton = document.getElementById('send-button');
            
            // Load existing messages
            let messages = JSON.parse(localStorage.getItem('anonymousMessages')) || [];
            
            // Function to display messages
            function displayMessages() {
                chatMessages.innerHTML = '';
                
                if (messages.length === 0) {
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'message';
                    emptyMessage.innerHTML = `
                        <div class="message-content">
                            No messages yet. Start the conversation!
                        </div>
                    `;
                    chatMessages.appendChild(emptyMessage);
                    return;
                }
                
                messages.forEach(message => {
                    const messageElement = document.createElement('div');
                    messageElement.className = `message ${message.userId === userId ? 'own' : ''}`;
                    
                    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    messageElement.innerHTML = `
                        <div class="message-content">
                            ${message.text}
                        </div>
                        <div class="message-info">
                            <span>${message.userId === userId ? 'You' : message.userId}</span>
                            <span style="margin-left: 8px;">${time}</span>
                        </div>
                    `;
                    
                    chatMessages.appendChild(messageElement);
                });
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // Function to send a message
            function sendMessage() {
                const text = messageInput.value.trim();
                if (text === '') return;
                
                const newMessage = {
                    userId: userId,
                    text: text,
                    timestamp: new Date().toISOString()
                };
                
                messages.push(newMessage);
                localStorage.setItem('anonymousMessages', JSON.stringify(messages));
                
                messageInput.value = '';
                displayMessages();
                
                // Simulate a response after a delay
                setTimeout(() => {
                    simulateResponse();
                }, 1000 + Math.random() * 3000);
            }
            
            // Function to simulate a response
            function simulateResponse() {
                const responses = [
                    "That's really interesting! Can you tell me more?",
                    "I understand how you feel. I've been in a similar situation.",
                    "Thanks for sharing that with me. It means a lot.",
                    "What do you think about this?",
                    "I appreciate your perspective on this.",
                    "That's a great point! I hadn't thought of it that way.",
                    "How has your day been going?",
                    "I'm here to listen if you need to talk more about this."
                ];
                
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                
                const botMessage = {
                    userId: 'Student' + Math.floor(Math.random() * 10000),
                    text: randomResponse,
                    timestamp: new Date().toISOString()
                };
                
                messages.push(botMessage);
                localStorage.setItem('anonymousMessages', JSON.stringify(messages));
                displayMessages();
            }
            
            // Event listeners
            sendButton.addEventListener('click', sendMessage);
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            // Initial display
            displayMessages();
        });
