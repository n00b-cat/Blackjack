const express = require('express');
const app = express();

// socket.io
const { createServer } = require('http');
const server = createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const port = 777;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const players = {};
let number = 1

io.on('connection', (socket) => {
    console.log('a user connected');

    players[socket.id] = {
        "name": "Player" + number++, 
        "hand": []
    };

    socket.on('disconnect', () => {
        console.log(players[socket.id].name + ' disconnected');
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });

    io.emit('updatePlayers', players);

    console.log(players);
});

server.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
});