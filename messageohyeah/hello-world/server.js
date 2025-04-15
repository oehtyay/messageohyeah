const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
let user;
var online = 0;


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
    });

    // when a client sends a message to server - send back to all clients
    socket.on('chat-message', (data) => {
        io.emit('chat-message', data);
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