const gridHandler = require("./gridHandler.js");
let shipNames = ["Patrol Boat", "Submarine", "Destroyer", "Battleship", "Carrier"];

exports.takeTurn = function(toShoot, current, other) { // Where code shared between player and enemy is ran
  const tileName = String.fromCharCode(toShoot[1] + 97).toUpperCase() + String(toShoot[0] + 1);
  let code = 0;
  let tileShot = gridHandler.shoot(other.shipGrid[toShoot[0]][toShoot[1]]) // tileShot = miss (2) or hit (3)
  current.shootGrid[toShoot[0]][toShoot[1]] = tileShot; // Update grids
  other.shipGrid[toShoot[0]][toShoot[1]] = tileShot;

  let destroyedText = "";
  let destroyCheck = [];

  destroyCheck = gridHandler.checkShips(other); // Check if any ship has been destroyed, if so add it to the text display so the player knows
  let textToAdd = " fired a shot at " + tileName + "! It was a ";
  if (tileShot === 2) {
    textToAdd += "miss...";
  } else {
    textToAdd += "hit!";
    code = 1;
  }

  for (let ship of destroyCheck) {
    if (!other.destroyed.includes(ship)) {
      destroyedText = " The " + shipNames[ship] + " that belonged to " + other.name + " has sunk!";
      other.destroyed.push(ship);
      code = 2;
    }
  }

  textToAdd += destroyedText;

  if (other.destroyed.length === other.ships.length) {
    current.won = true;
  }
  return [code, textToAdd];
}

exports.checkWinner = function(current, other) {
  let currentResult = "";
  let otherResult = "";

  if (current.won && !other.won) {
    currentResult += "Congratulations! You have won!";
    otherResult += current.name + " has won! Better luck next time...";
  } else if (!current.won && other.won) {
    currentResult += other.name + " has won! Better luck next time...";
    otherResult += "Congratulations! You have won!";
  } else if (current.won && other.won) {
    currentResult += "It is a draw!";
    otherResult += "It is a draw!";
  } else {
    return false;
  }

  return [currentResult, otherResult];
}