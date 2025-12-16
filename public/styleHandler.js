function updateBorder(tile, dir, varType) {
  let toAdd = "";
  if (dir.includes(-1)) {
    toAdd += "border-top: 1px solid var(--" + varType + "-color);"
  }
  if (dir.includes(1)) {
    toAdd += "border-bottom: 1px solid var(--" + varType + "-color);;"
  }
  if (dir.includes(-2)) {
    toAdd += "border-left: 1px solid var(--" + varType + "-color);;"
  }
  if (dir.includes(2)) {
    toAdd += "border-right: 1px solid var(--" + varType + "-color);;"
  }
  if (toAdd === "") {
    return;
  } else {
    tile.style = toAdd;
  }
}

function showProjection(current, projection) {
  let colour = "";
  let leftSizes = [2, 3, 3, 4, 5];

  for (let ship of current.ships) {
    leftSizes.splice(leftSizes.indexOf(ship.length), 1);
  }

  if (projection === []) {
    return;
  }
  for (let pos of projection) {
    let cell = document.getElementById("S" + String(pos[0]) + String(pos[1]))
    if (!leftSizes.includes(projection.length)) {
      colour = "hit";
      cell.className = "grid-hit";
    } else {
      colour = "projection";
      cell.className = "grid-projection";
    }
  }
  for (let pos of projection) {
    let cell = document.getElementById("S" + String(pos[0]) + String(pos[1]))
    let nearbyDir = checkFor(current, 0, pos[0], pos[1], current.setupGrid, false, false)
    let nearbyPos = checkFor(current, 0, pos[0], pos[1], current.setupGrid, false, true)
    let toAdd = []
    for (let i = 0; i < nearbyPos.length; i++) {
      let pos2 = nearbyPos[i]
      let cell2 = document.getElementById("S" + String(pos2[0]) + String(pos2[1]))
      if (cell2.className != "grid-blank") {
        toAdd.push(nearbyDir[i]);
      }
    }
    if (toAdd.length > 0) {
      updateBorder(cell, toAdd, "colour");
    }
  }
}

function updateText(current) {
  let sizes = [2, 3, 3, 4, 5];
  let leftSizes = [2, 3, 3, 4, 5];
  let shipNames = ["Patrol Boat", "Submarine", "Destroyer", "Battleship", "Carrier"];

  for (let ship of current.ships) {
    leftSizes.splice(leftSizes.indexOf(ship.length), 1);
  }
  
  let text = document.getElementById("shipsNeeded");
  text.innerHTML = "Ships left to place: "
  let toAdd = "";
  let temp = [];
  for (let size of leftSizes) {
    temp.push(size);
  }
  let index = 0;
  while (temp.length > 0) {
    if (temp.includes(sizes[index])) {
      toAdd += `${shipNames[index]} (${sizes[index]})`
      temp.splice(temp.indexOf(sizes[index]), 1)
      if (temp.length != 0) {
        toAdd += ", ";
      }
    }
    index++;
  }
  if (toAdd === "") {
    text.innerHTML = "All ships have been placed. Press done when are ready to play the game!"
    document.getElementById("playButton").style = "display:inline";
  } else {
    text.innerHTML += toAdd;
    document.getElementById("playButton").style = "display:none";
  }

}

