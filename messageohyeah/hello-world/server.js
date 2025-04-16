const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
let user;
let lastUser;
var online = 0;
var idle = 0;


app.use(express.static('public'));
const cors = require('cors');
app.use(cors());
app.get('/', (req, res) => {
    res.send('hi loser');
});

// user connects to the server
io.on('connection', (socket) => {
    socket.on('sendUsername', (username) => {
        user = username.username;
        console.log('-~~~~~~ ' + user + ' connected ~~~~~~-');
        online++;
        io.emit('online', { online: online });
        io.emit('idle', { idle: idle });
    });

    // when a client sends a message to server - send back to all clients
    socket.on('chat-message', (data) => {
        if (data.username == lastUser) {
            newData = { username: "", message: data.message };
            io.emit('chat-message', newData);
        } else {
            io.emit('chat-message', data); 
            lastUser = data.username;
        }
    });

    // when a client detects that a user is idle
    socket.on('notIdle', (data) => {
        if (data.notIdle) {
            idle--;
        } else {
            idle++;
        }
        io.emit('idle', { idle: idle });
    });

    // user disconnect
    socket.on('disconnect', () => {
        console.log('-~~~~~~ a user disconnected ~~~~~~-');
        online--;
        io.emit('online', { online: online });
    });
});

server.listen(3000, () => {
    console.log('server running on port 3000');
});

process.on('SIGINT', () => {
    console.log('server commencing shutdown --> waiting for all users to leave');
    server.close(() => {
        console.log('server successfully shutdown')
        process.exit(0); 
    });
});