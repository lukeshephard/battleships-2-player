let sizes = [2, 3, 3, 4, 5];

exports.Board = function(id, ships, name, number) { // Board constructor, for player and enemy setup
  this.id = id;
  this.ships = ships;
  this.shootGrid = exports.createGrid([]); // two grids - one for own ships and enemy shots and other for own shots
  this.shipGrid = exports.createGrid();
  this.setupGrid = exports.createGrid([]);
  this.name = name;
  this.number = number;
  this.destroyed = [];
  this.turn = false;
  this.ready = false;
  this.won = false;
}


exports.createGrid = function(ships = []) { // creates maps for constructor - adds ships to empty grid
  let grid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
  for (let y = 0; y < grid.length; y++) { // add ships to map (top map only)
    for (let x = 0; x < grid[y].length; x++) {
      for (let ship of ships) {
        for (let pos of ship) {
          if (pos[0] === y && pos[1] === x) {
            grid[y][x] = 1;
          }
        }
      }
    }
  }
  return grid;
}

exports.generateShips = function() {
  let result = [[], [], [], [], []]; // Where the final ship positions are stored
  for (let i = 0; i < sizes.length; i++) { // Loop through each ship size to generate positions
    let rotation = Math.round(Math.random())
    if (rotation) { // if rotation === 1 (1 = true), vertical - positions go down from the start number
      let toFind = [Math.round(Math.random() * (10 - sizes[i])), Math.round(Math.random() * 9)] // Random tile that will take whole ship size. It is checked first to see if it is alreay taken, if it is then it restarts.
      if (isOccupied(toFind, result)) {
        return exports.generateShips();
      }
      result[i].push(toFind);
      for (let j = 1; j < sizes[i]; j++) { // Add following positions, checking if the tile is occupied so see if a restart is needed.
        if (isOccupied([result[i][0][0] + j, result[i][0][1]], result)) {
          return exports.generateShips();
        }
        result[i].push([result[i][0][0] + j, result[i][0][1]])
      }
    } else { // horizontal - positions go right from start number
      let toFind = [Math.round(Math.random() * 9), Math.round(Math.random() * (10 - sizes[i]))]
      if (isOccupied(toFind, result)) {
        return exports.generateShips();
      }
      result[i].push(toFind);
      for (let j = 1; j < sizes[i]; j++) {
        if (isOccupied([result[i][0][0], result[i][0][1] + j], result)) {
          return exports.generateShips();
        }
        result[i].push([result[i][0][0], result[i][0][1] + j])
      }
    }
  }
  return result;
}

function isOccupied(condition, grid) { // To stop two ships in one tile when generating
  for (let row of grid) {
    for (let pos of row) {
      if (pos[0] === condition[0] && pos[1] === condition[1]) { // Checks if a ship is already there
        return true;
      }
    }
  }
  return false;
}

exports.shoot = function(tile) { // Checks if the tile chosen is a hit or a miss
  switch (tile) {
    case 0: // Empty
      return 2; // Miss
    case 1: // Ship
      return 3; // Hit
    default:
      return tile; // Change nothing if same tile was hit more than once
  }
}

exports.checkShips = function(current) { // A check to see if any ships are destroyed, returning the index of it so it can be identified
  let ships = current.ships;
  let grid = current.shipGrid;
  let output = [];
  for (let ship of ships) {
    let destroyed = true;
    for (let pos of ship) {
      if (grid[pos[0]][pos[1]] === 1) { // If any part of ship has not been hit, it is not destroyed
        destroyed = false;
      }
    }
    if (destroyed) {
      output.push(ships.indexOf(ship));
    }
  }
  return output;
}
