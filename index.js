'use strict'

const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const publicPath = path.join(__dirname, "/public");
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const gridHandler = require("./server/gridHandler.js");
const turnHandler = require("./server/turnHandler.js");
const setupHandler = require("./server/setupHandler.js");

let inSetup = true;

app.use(express.static(publicPath));

let players = [];

io.on("connection", function(socket) { // When user connected
  if (players.length === 0) {
    inSetup = true;
  }
  if (players.length > 1) {
    socket.join(socket.id);
    io.sockets.in(socket.id).emit("fail", { reason: "2 Players are already playing." })
    socket.disconnect();
    return;
  }
  players.push(new gridHandler.Board(socket.id, [], "Player " + (players.length + 1), players.length + 1));

  for (let player of players) {
    if (player.id === socket.id) {
      socket.join(player);
    }
  }

  socket.on("disconnect", function() {
    for (let player of players) {
      if (player.id === socket.id) {
        players.splice(players.indexOf(player), 1);
        break
      }
    }
    if (players.length === 1) {
      io.sockets.in(players[0]).emit("fail", { reason: "Other player disconnected." })
      io.sockets.sockets.get(players[0].id).disconnect()
    }
  });

  io.emit("connected");

  if (io.engine.clientsCount === 2) { // Wait for 2 players then start the game
    players[0].turn = true;
    for (let player of players) {
      let index = players.indexOf(player);
      io.sockets.in(player).emit("bothConnected", { data: players[index] });


    }

  }

  socket.on("ready", function(data) {

    let current;
    let enemy;
    for (let player of players) {
      if (player.id === socket.id) {
        current = player;
      } else {
        enemy = player;
      }
    }
    if (current.ships.length === 5) {
      current.ready = true;
      if (data.username != "") {
        current.name = data.username;
      }
      if (current.ready && enemy.ready) {
        inSetup = false;
        current.shipGrid = gridHandler.createGrid(current.ships);
        io.sockets.in(current).emit("startGame", { data: current, enemyName: enemy.name });
        enemy.shipGrid = gridHandler.createGrid(enemy.ships);
        io.sockets.in(enemy).emit("startGame", { data: enemy, enemyName: current.name });
      } else {
        io.sockets.in(current).emit("getReady");
      }
    }
  })

  socket.on("cellClicked", function(data) {
    let current;
    let enemy;
    for (let player of players) {
      if (player.id === socket.id) {
        current = player;
      } else {
        enemy = player;
      }
    }
    let tile = data.tile;
    if (inSetup) {
      let projection = setupHandler.addSetupShip(tile, current);
      //current.setupGrid[tile[0]][tile[1]] = 2;
      io.sockets.in(current).emit("updateGrid", { data: current, setup: inSetup, projection: projection })
    } else {
      if (current.turn) {
        let result = turnHandler.takeTurn(tile, current, enemy);
        io.sockets.in(current).emit("updateGrid", { data: current, setup: inSetup })
        io.sockets.in(enemy).emit("updateGrid", { data: enemy, setup: inSetup })
        current.turn = false;
        io.sockets.in(current).emit("updateInformation", { data: current, information: "You" + result[1] })
        io.sockets.in(enemy).emit("updateInformation", { data: enemy, information: current.name + result[1] })
        result = turnHandler.checkWinner(current, enemy);
        setTimeout(function() {
          if (current === players[1] && result != false) {
            io.sockets.in(current).emit("updateInformation", { data: current, information: result[0] })
            io.sockets.in(enemy).emit("updateInformation", { data: enemy, information: result[1] })
          } else {
            enemy.turn = true;
            io.sockets.in(current).emit("updateInformation", { data: current })
            io.sockets.in(enemy).emit("updateInformation", { data: enemy })
          }

        }, 3000)
      }
    }
  });
  socket.on("cellRightClicked", (data) => {
    if (inSetup) {
      let current;
      for (let player of players) {
        if (player.id === socket.id) {
          current = player;
        }
      }
      setupHandler.destroySetupShip(current, data.tile);
      io.sockets.in(current).emit("updateGrid", { data: current, setup: inSetup })
    }
  });

  socket.on("cellHoverIn", (data) => {
    if (inSetup) {
      let current;
      for (let player of players) {
        if (player.id === socket.id) {
          current = player;
        }
      }
      let projection = setupHandler.setupHoverIn(data.tile, current);
      io.sockets.in(current).emit("updateGrid", { data: current, setup: inSetup, projection: projection })
    }
  })
});


server.listen(port, function() {
  console.log(port);
});
