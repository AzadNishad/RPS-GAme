// Load Socket.IO script asynchronously
var script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.2.0/socket.io.js';
script.onload = function () {

    const socket = io();

    socket.on('opponentName', function (opponentName) {
        document.getElementById('opponentName').textContent = `Your opponent: ${opponentName}`;
    });

    socket.on('message', function (msg) {
        console.log(msg);
        document.getElementById('gameResult').textContent = msg;
    });

    document.querySelectorAll('#choices button').forEach(button => {
        button.addEventListener('click', function () {
            const choice = this.id;
            socket.send(choice);
        });
    });

};

script.onerror = function () {
    console.error('Failed to load Socket.IO script');
};
document.head.appendChild(script);