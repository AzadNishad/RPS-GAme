const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let player1 = null;
let player2 = null;

io.on('connection', function (socket) {
    if (!player1) {
        player1 = socket;
        player1.emit('yourName', 'Player 1');
    } else if (!player2) {
        player2 = socket;
        player2.emit('yourName', 'Player 2');
        // Emit the opponent's name to each player
        player1.emit('opponentName', 'Player 2'); // Send Player 2's name to Player 1
        player2.emit('opponentName', 'Player 1'); // Send Player 1's name to Player 2
        // Start the game when both players are connected
        startGame();
    } else {
        socket.disconnect();
    }

    socket.on('message', function (message) {
        // Broadcast the message to the other player
        if (socket === player1) {
            player1.emit('message', 'You choice ' + message);
            player1.choice = message;
        } else if (socket === player2) {
            player2.emit('message', 'You choice ' + message);
            player2.choice = message;
        }

        // Check if both players have made their choices
        if (player1.choice && player2.choice) {
            const result = determineWinner(player1.choice, player2.choice);
            player1.emit('message', result);
            player2.emit('message', result);
            // Reset choices for the next round
            player1.choice = null;
            player2.choice = null;
        }
    });

    socket.on('disconnect', function () {
        if (socket === player1) {
            player1 = null;
        } else if (socket === player2) {
            player2 = null;
        }
    });
});

function startGame() {
    player1.emit('message', 'Both players connected. Let the game begin!');
    player2.emit('message', 'Both players connected. Let the game begin!');
    player1.emit('message', 'Please choose: rock, paper, or scissors.');
    player2.emit('message', 'Please choose: rock, paper, or scissors.');
}

function determineWinner(player1Choice, player2Choice) {
    if (player1Choice === player2Choice) {
        return 'It\'s a tie!';
    } else if (
        (player1Choice === 'rock' && player2Choice === 'scissors') ||
        (player1Choice === 'paper' && player2Choice === 'rock') ||
        (player1Choice === 'scissors' && player2Choice === 'paper')
    ) {
        return 'Player 1 wins! 🎉🎉';
    } else {
        return 'Player 2 wins! 🎉🎉';
    }
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for serving the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, function () {
    console.log(`Server running on port http://localhost:${PORT}/`);
});