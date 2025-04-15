const socket = io("https://messageohyeah.onrender.com");
const connectStatus = document.getElementById("connectStatus");
const messageInput = document.getElementById("message");
const messageArea = document.getElementById('messageArea');
let username;

socket.on('disconnect', () => {
    connectStatus.textContent = "you have been disconnected from the server :(";
});

socket.on('connect', () => {
    username = "user-" + Math.floor(Math.random() * 1000000);
    connectStatus.textContent = "you have been connected to the server as " + username;
    socket.emit('sendUsername', { username: username });
    socket.emit('chat-message', { username: username + " has joined the chat room", message: "" });
});
  
socket.on('connect_error', (error) => {
    connectStatus.textContent = error + " ~~~~~~ the server is not active - pls wait for it to wake up :)";
});

socket.on('chat-message', (data) => {
    fromNewUser = document.createElement('b');
    newMessageContent = document.createElement('p');
    fromNewUser.textContent = data.username;
    newMessageContent.textContent = data.message;
    messageArea.appendChild(fromNewUser);
    messageArea.appendChild(newMessageContent);
    scrollToBottom();
});

socket.on('online', (num) => {
    console.log('hi')
    const onlineNum = document.getElementById('online');
    onlineNum.textContent = num.online + " users online";
});

function sendMessage() {
    if (messageInput.value.trim() != "") {
        socket.emit('chat-message', { username: username, message: messageInput.value });
        messageInput.value = "";
    }
}

function scrollToBottom() {
    const messageArea = document.getElementById('messageArea');
    messageArea.scrollTop = messageArea.scrollHeight;
}

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

window.addEventListener("beforeunload", () => {
    socket.emit('chat-message', { username: username + " has left the chat room", message: "" });
});
