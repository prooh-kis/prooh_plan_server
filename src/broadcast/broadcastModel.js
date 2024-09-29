import { Server } from "socket.io";

var wss;

function createWebSocket(server) {
    wss = new Server(server);
    wss.on('connection', (socket) => {
        console.log('New user connected');
        // when server disconnects from user
        socket.on('disconnect',
            () => {
                console.log('disconnected from user');
            });
    });
}

function broadcast(message) {
    console.log(message)
    wss.emit('message', message);
    return true
}


export {
    createWebSocket, broadcast
}
