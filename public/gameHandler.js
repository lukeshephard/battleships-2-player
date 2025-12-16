let socket;
let player;
let setup;
let enemyName;
let connectDiv = document.getElementById("connect");
let setupDiv = document.getElementById("setup");
let gameDiv = document.getElementById("game")
let projection = [];

function connect() {
  socket = io();
  socket.on("connected", () => {
    hideConnectButton();
  });
  socket.on("bothConnected", (data) => {
    player = data.data;
    document.getElementById("bothConnected").style.display = "inline";
    document.getElementById("usernameBox").placeholder = "Player " + player.number;
    document.getElementById("playerStatus").innerHTML = "Other player connected! Please place your ships in the grid below.";
    drawGrid(player.setupGrid, "S", document.getElementById("setupGrid"), true, true)
  })

  socket.on("startGame", (data) => {
    player = data.data;
    enemyName = data.enemyName;
    startGame(player);
    updateInformation();
  })

  socket.on("updateGrid", (data) => {
    player = data.data;
    if (data.setup) {
      updateGrid(player.setupGrid, player, document.getElementById("setupGrid"), "S");
      if (data.projection != undefined) {
        projection = data.projection;
      }
      showProjection(player, projection)
      updateText(player);

    } else {
      player = data.data;
      updateGrid(player.shootGrid, player, document.getElementById("shootGrid"), "A");
      updateGrid(player.shipGrid, player, document.getElementById("shipGrid"), "B");
    }
  })

  socket.on("updateInformation", (data) => {
    player = data.data;
    updateInformation(data.information);
  });

  socket.on("fail", (data) => {
    document.getElementById("failReason").innerHTML = data.reason;
    quitGame();
  })

  socket.on("getReady", () => {
    document.getElementById("playerStatus").innerHTML = "Waiting for the other player to finish placing their ships...";
    document.getElementById("bothConnected").style.display = "none";
  })

}

function ready() {
  socket.emit("ready", {username: document.getElementById("usernameBox").value});
}

function hideConnectButton() {
  connectDiv.style.display = "none";
  setupDiv.style.display = "inline";
  gameDiv.style.display = "none";
}

function startGame(player) {
  connectDiv.style.display = "none";
  setupDiv.style.display = "none";
  gameDiv.style.display = "inline";
  drawGrid(player.shootGrid, "A", document.getElementById("shootGrid"), true)
  drawGrid(player.shipGrid, "B", document.getElementById("shipGrid"))
  updateGrid(player.shootGrid, player, document.getElementById("shootGrid"), "A");
  updateGrid(player.shipGrid, player, document.getElementById("shipGrid"), "B");
}

function quitGame() {
  connectDiv.style.display = "inline";
  setupDiv.style.display = "none";
  gameDiv.style.display = "none";
  document.getElementById("playerStatus").innerHTML = "Waiting for another player...";
  document.getElementById("setupGrid").innerHTML = "";
  document.getElementById("bothConnected").style.display = "none";
}

function onCellClick(tile) {
  socket.emit("cellClicked", { tile: tile });
}

function onCellRightClick(tile) {
  socket.emit("cellRightClicked", { tile: tile })
}

function onCellHoverIn(tile) {
  socket.emit("cellHoverIn", { tile: tile });
}

function onCellHoverOut(tile) {
  true;
}

function updateInformation(information) {
  if (information === undefined) {
    if (player.turn) {
      information = "It is your turn. Click a space in the grid above to shoot."
    } else {
      information = "Waiting for " + enemyName + " to shoot..."
    }
  }
  document.getElementById("information").innerHTML = information;
}