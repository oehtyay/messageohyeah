const socket = io("https://messageohyeah.onrender.com");
//const socket = io("http://localhost:3000");
const connectStatus = document.getElementById("connectStatus");
const messageInput = document.getElementById("message");
const messageArea = document.getElementById('messageArea');
const onlineNum = document.getElementById('online');
const usernameInput = document.getElementById('inputUsername');
const usernameBox = document.getElementById('promptBox');

let idleTimeout;
const idleTimeLimit = 60000; // 1 minute

let username;
var online;
var idle;

socket.on('disconnect', () => {
    connectStatus.textContent = "you have been disconnected from the server :(";
});

function go() {
    usernameBox.classList.add('remove');
    username = usernameInput.value;
    if (username.trim() == "") {
        username = "thats not a valid username";
    }
    connectStatus.textContent = "you have joined as " + username;
    socket.emit('sendUsername', { username: username });
    socket.emit('chat-message', { username: username + " has joined the chat room", message: "" });
    message.disabled = false;
}

socket.on('connect', () => {
    connectStatus.textContent = "you have been connected - enter username to chat";
    usernameBox.classList.remove('remove');
});
  
socket.on('connect_error', (error) => {
    connectStatus.textContent = error + " ~~~~~~ pls wait for server to wake up (~30s), or get better internet ¯\\_(ツ)_/¯";
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

function updateList() {
    onlineNum.textContent = `${online} users connected | ${idle} users idle`;
}

socket.on('online', (num) => {
    online = num.online;
    updateList();
});

socket.on('idle', (num) => {
    idle = num.idle;
    updateList();
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

var notIdle = true;

function userIsActive() {
    clearTimeout(idleTimeout);
    if (!notIdle) {
        socket.emit('notIdle', { notIdle: true });
        notIdle = true;
    }
    idleTimeout = setTimeout(() => {
        socket.emit('notIdle', { notIdle: false });
        notIdle = false;
    }, idleTimeLimit);
}

['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, userIsActive);
});

userIsActive();