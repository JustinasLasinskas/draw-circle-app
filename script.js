const canvas = document.getElementById("drawCanvas");
const bestScoreContainer = document.getElementById("bestScoreContainer");
const scoreBar = document.getElementById("scoreBar");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

// Set lineJoin and lineCap properties
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.lineWidth = 5;
ctx.imageSmoothingEnabled = true;

// Initial states
let drawing = false;
let allCoordinates = [];
let x = 0;
let y = 0;
let allScores = [];
let newScore;

// Function to get the correct mouse position
function getMousePos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width; // relationship bitmap vs. element for X
  const scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    x: (event.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (event.clientY - rect.top) * scaleY, // been adjusted to be relative to element
  };
}

// Update the x and y coordinates where the drawing will start
const startDrawing = (event) => {
  const pos = getMousePos(canvas, event);
  x = pos.x;
  y = pos.y;
  drawing = true;
};

// Draw on the canvas
const draw = (event) => {
  if (!drawing) return;
  ctx.beginPath();
  ctx.moveTo(x, y);
  const newPos = getMousePos(canvas, event);
  ctx.lineTo(newPos.x, newPos.y);
  ctx.stroke();
  x = newPos.x;
  y = newPos.y;
  allCoordinates.push({ x, y });
};

// clear canvas
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  scoreBar.classList.add("invisible");
};

// find largest x in allCoordinates and return {x, y} coordinates
const findMostRight = (allCoordinates) => {
  let largestX = 0;
  let largestY = 0;
  allCoordinates.forEach((coordinate) => {
    if (coordinate.x > largestX) {
      largestX = coordinate.x;
      largestY = coordinate.y;
    }
  });
  return { x: largestX, y: largestY };
};
// find smallest x in allCoordinates and return {x, y} coordinates
const findMostLeft = (allCoordinates) => {
  let smallestX = canvas.width;
  let smallestY = canvas.height;
  allCoordinates.forEach((coordinate) => {
    if (coordinate.x < smallestX) {
      smallestX = coordinate.x;
      smallestY = coordinate.y;
    }
  });
  return { x: smallestX, y: smallestY };
};
// find largest y in allCoordinates and return {x, y} coordinates
const findMostBottom = (allCoordinates) => {
  let largestY = 0;
  let largestX = 0;
  allCoordinates.forEach((coordinate) => {
    if (coordinate.y > largestY) {
      largestY = coordinate.y;
      largestX = coordinate.x;
    }
  });
  return { x: largestX, y: largestY };
};
// find smallest y in allCoordinates and return {x, y} coordinates
const findMostTop = (allCoordinates) => {
  let smallestY = canvas.height;
  let smallestX = canvas.width;
  allCoordinates.forEach((coordinate) => {
    if (coordinate.y < smallestY) {
      smallestY = coordinate.y;
      smallestX = coordinate.x;
    }
  });
  return { x: smallestX, y: smallestY };
};

// calculate the middle point of the drawing based on the most left and most right points and most top and most bottom points and draw a red circle
const drawMiddlePoint = () => {
  const mostRight = findMostRight(allCoordinates);
  const mostLeft = findMostLeft(allCoordinates);
  const mostBottom = findMostBottom(allCoordinates);
  const mostTop = findMostTop(allCoordinates);
  ctx.beginPath();
  const diameter = mostRight.x - mostLeft.x;
  const radius = diameter / 2;
  const middleX = mostLeft.x + radius;
  const middleY = (mostBottom.y + mostTop.y) / 2;
  ctx.arc(middleX, middleY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "#6ce895";
  ctx.stroke();
  ctx.strokeStyle = "black";
};
// draw an elipse based on the most left and most right points and most top and most bottom points
const drawCircle = () => {
  const mostRight = findMostRight(allCoordinates);
  const mostLeft = findMostLeft(allCoordinates);
  const mostBottom = findMostBottom(allCoordinates);
  const mostTop = findMostTop(allCoordinates);
  ctx.beginPath();
  const diameter = mostRight.x - mostLeft.x;
  const height = mostBottom.y - mostTop.y;
  const radius = diameter / 2;
  const middleX = mostLeft.x + radius;
  const middleY = (mostBottom.y + mostTop.y) / 2;
  ctx.ellipse(middleX, middleY, radius, height / 2, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "#e8294c";
  ctx.stroke();
  ctx.strokeStyle = "black";
};

// Calculate roundness of the drawing based on the most left and most right points and most top and most bottom points
const calculateRoundness = () => {
  let roundness;
  const mostRight = findMostRight(allCoordinates);
  const mostLeft = findMostLeft(allCoordinates);
  const mostBottom = findMostBottom(allCoordinates);
  const mostTop = findMostTop(allCoordinates);
  const diameter = mostRight.x - mostLeft.x;
  const height = mostBottom.y - mostTop.y;
  if (diameter > height) {
    roundness = height / diameter;
  } else {
    roundness = diameter / height;
  }
  return roundness;
};

// Stop drawing
const stopDrawing = () => {
  let roundedCoords = [];
  allCoordinates.forEach((coordinate) => {
    roundedCoords.push({
      x: Math.round(coordinate.x / 4) * 4,
      y: Math.round(coordinate.y / 4) * 4,
    });
  });

  // Check if there are any coordinates that are the same and forms a shape
  let isTouching = false;
  for (let i = 0; i < roundedCoords.length; i++) {
    for (let j = 0; j < roundedCoords.length; j++) {
      if (i !== j) {
        if (
          roundedCoords[i].x === roundedCoords[j].x &&
          roundedCoords[i].y === roundedCoords[j].y
        ) {
          isTouching = true;
          break;
        }
      }
    }
  }
  drawing = false;

  if (isTouching && allCoordinates.length >= 20) {
    newScore = calculateRoundness();
    allScores.push(newScore.toFixed(3));

    if (allScores.length > 0) {
      allScores.sort((a, b) => b - a);
    }
    if (allScores.length > 5) {
      allScores = allScores.slice(0, 5);
    }
    scoreBar.classList.remove("invisible");
    scoreBar.innerText = `Score: ${newScore.toFixed(3)}`;
    setTimeout(clearCanvas, 2000);
    drawMiddlePoint();
    drawCircle();
  } else {
    scoreBar.classList.remove("invisible");
    scoreBar.innerText = "Not a circle!";
    setTimeout(clearCanvas, 1000);
  }

  allCoordinates = [];
  roundedCoords = [];
  fillInBestScores(allScores);
};

// Fill in the best scores
const fillInBestScores = (allScores) => {
  if (allScores.length > 0) {
    bestScoreContainer.innerHTML = "";
    allScores.map((score, index) => {
      const scoreContainer = document.createElement("div");
      scoreContainer.classList.add(
        "flex",
        "border-b-2",
        "border-gray-100",
        "py-2"
      );
      scoreContainer.appendChild(
        document.createTextNode(`${index + 1}. ${score}`)
      );
      bestScoreContainer.appendChild(scoreContainer);
    });
  }
};

// Event listeners
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);
