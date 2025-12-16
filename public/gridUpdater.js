function drawGrid(grid, identifier = false, container = undefined, clickable = false, hoverable = false) {
  container.innerHTML = "";
  container.style.setProperty("--grid-rows", grid.length + 1);
  container.style.setProperty("--grid-columns", grid[0].length + 1);
  container.appendChild(document.createElement("div")).className = "grid-blank";

  for (let y = 0; y < grid[0].length; y++) {
    let tile = document.createElement("div");
    container.appendChild(tile).className = "grid-blank";
    tile.innerHTML = String.fromCharCode(y + 65);
  }

  for (let y = 0; y < grid.length; y++) {
    let cell = document.createElement("div");
    container.appendChild(cell).className = "grid-blank";
    cell.innerHTML = y + 1;
    for (let x = 0; x < grid[y].length; x++) {
      cell = document.createElement("div");
      let child = container.appendChild(cell);
      child.className = "grid-blank";
      cell.id = identifier + String(y) + String(x);
      if (clickable) {
        child.addEventListener("click", function () {
          onCellClick([y, x]);
        })
        child.addEventListener("contextmenu", function (event) {
          event.preventDefault();
          onCellRightClick([y, x]);
        })
      }
      if (hoverable) {
        child.addEventListener("mouseover", function () {
          onCellHoverIn([y, x]);
        })
      }
    }
  }
}

function updateGrid(grid, current, container, identifer) { // updates grid to webpage (user needs to see)
  for (let y = 0; y < grid.length; y++) {
    let nearby = []
    for (let x = 0; x < grid[0].length; x++) {
      let tile = document.getElementById(identifer + String(y) + String(x));
      switch (grid[y][x]) {
        case 1:
          tile.className = "grid-ship";
          nearby = checkFor(current, 1, y, x, grid, true, false, undefined).concat(checkFor(current, 3, y, x, grid, true, false, undefined));
          if (nearby.length > 0) {
            updateBorder(tile, nearby, "ship");
          }
          break;
        case 2:
          tile.className = "grid-miss";
          break;
        case 3:
          tile.className = "grid-hit";
          if (grid === current.shootGrid) {
            nearby = checkFor(current, 3, y, x, current.shootGrid, false, false, undefined);
          } else {
            nearby = checkFor(current, 1, y, x, current.shipGrid, true, false, undefined).concat(checkFor(current, 3, y, x, current.shipGrid, true, false, undefined));
          }
          if (nearby.length > 0) {
           updateBorder(tile, nearby, "hit");
          }
          break;
        default:
          tile.className = "grid-blank";
          updateBorder(tile, [-2, -1, 1, 2], "outline")
      }
    }
  }
}


function checkFor(current, filter, y, x, grid, bothSameShip = false, getPos = true, only = [-2, -1, 1, 2]) {
  let found = [];
  let foundDir = [];
  if (y > 0) {
    if (grid[y - 1][x] === filter && (!bothSameShip || sameShip(current, [y, x], [y - 1, x])) && only.includes(-1)) {
      found.push([y - 1, x])
      foundDir.push(-1);
    }
  }
  if (y < grid.length - 1) {
    if (grid[y + 1][x] === filter && (!bothSameShip || sameShip(current, [y, x], [y + 1, x])) && only.includes(1)) {
      found.push([y + 1, x])
      foundDir.push(1);
    }
  }
  if (x > 0) {
    if (grid[y][x - 1] === filter && (!bothSameShip || sameShip(current, [y, x], [y, x - 1])) && only.includes(-2)) {
      found.push([y, x - 1])
      foundDir.push(-2);
    }
  }
  if (x < grid.length - 1) {
    if (grid[y][x + 1] === filter && (!bothSameShip || sameShip(current,[y, x], [y, x + 1])) && only.includes(2)) {
      found.push([y, x + 1])
      foundDir.push(2);
    }
  }
  if (getPos) {
    return found;
  } else {
    return foundDir;
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

