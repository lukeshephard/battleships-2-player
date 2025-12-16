gridHandler = require("./gridHandler.js");

let sizes = [2, 3, 3, 4, 5];
let clickedOn = [];
let projection = [];
let currentShip = [];

exports.addSetupShip = function(tile, current) {
  let leftSizes = [];
  let projection;

  for (let size of sizes) {
    leftSizes.push(size);
  }

  for (let ship of current.ships) {
    leftSizes.splice(leftSizes.indexOf(ship.length), 1);
  }

  if (leftSizes.length === 0) { // No ships left to place
    return projection;
  }
  if (current.setupGrid[tile[0]][tile[1]] === 1) { // Ship aready there
    return projection;
  }
  clickedOn.push(tile);
  if (clickedOn.length === 2) { // adds ship
    if (clickedOn[0][0] === clickedOn[1][0] && clickedOn[0][1] === clickedOn[1][1]) {
      clickedOn.pop()
      return projection;
    }
    let ship = createShip(currentShip[0], currentShip[currentShip.length - 1]);
    if (ship === false) {
      clickedOn = [];
      projection = [];
      return projection;
    }
    if (!leftSizes.includes(ship.length)) {
      clickedOn.pop();
      return projection;
    }
    for (let pos of ship) {
      if (current.setupGrid[pos[0]][pos[1]] === 1) {
        clickedOn = [];
        projection = [];
        return projection;
      }
    }
    current.ships.push(ship);
    for (let pos of ship) {
      current.setupGrid[pos[0]][pos[1]] = 1;
    }
    clickedOn = [];
    projection = [];
  } else {
    projection = [tile];
  }
  return projection;
}

function createShip(first, last) {
  let predicted = [];
  predicted.push(last);
  let direction = false;
  if (first[1] > last[1]) {
    direction = 2;
  } else if (first[1] < last[1]) {
    direction = -2;
  } else if (first[0] > last[0]) {
    direction = 1;
  } else {
    direction = -1;
  }
  let i = 0;
  let lastPoint = last;
  while (true) {
    lastPoint = predicted[predicted.length - 1];
    if (lastPoint[0] == first[0] && lastPoint[1] == first[1]) {
      break;
    }
    if (direction === 2) { // right
      predicted.push([lastPoint[0], lastPoint[1] + 1]);
    } else if (direction === -2) { // left
      predicted.push([lastPoint[0], lastPoint[1] - 1]);
    }
    if (direction === 1) { // up
      predicted.push([lastPoint[0] + 1, lastPoint[1]]);
    } else if (direction === -1) { // down
      predicted.push([lastPoint[0] - 1, lastPoint[1]]);
    }
    i++;
    if (i > 10) {
      return false;
    }
  }
  return predicted;
}

exports.setupHoverIn = function(tile, current) {
  let leftSizes = [];

  for (let size of sizes) {
    leftSizes.push(size);
  }

  for (let ship of current.ships) {
    leftSizes.splice(leftSizes.indexOf(ship.length), 1);
  }
  projection = []
  if (clickedOn.length === 0) {
    return;
  }
  let ship = createShip(clickedOn[0], tile);
  if (ship === false || ship.length > leftSizes[leftSizes.length - 1]) {
    return;
  }
  for (let pos of ship) {
    if (current.setupGrid[pos[0]][pos[1]] === 1) {
      return;
    }
  }
  for (let pos of ship) {
    projection.push(pos);
  }
  currentShip = projection;
  return projection;
}

exports.destroySetupShip = function(current, tile) {
  for (let i = 0; i < current.ships.length; i++) {
    let ship = current.ships[i];
    if (sameShip(current, tile, ship[0])) {
      current.ships.splice(i, 1);
      for (let pos of ship) {
        current.setupGrid[pos[0]][pos[1]] = 0;
      }
      break
    }
  }
}


function sameShip(current, tile1, tile2) {
  let ships = current.ships;
  for (let ship of ships) {
    let found = 0;
    for (let pos of ship) {
      if (pos[0] === tile1[0] && pos[1] === tile1[1]) {
        found++
      }
      if (pos[0] === tile2[0] && pos[1] === tile2[1]) {
        found++
      }
    }
    if (found === 2) {
      return true;
    }
  }
  return false;
}