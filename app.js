const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let dots = [];
const totalDots = 1000;
let lineStart = null;
let lineEnd = null;
let isDrawing = false;

// Function to generate random dots
function generateDots() {
    for (let i = 0; i < totalDots; i++) {
        const dot = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
        };
        dots.push(dot);
    }
}

// Function to draw the dots on the canvas
function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Function to handle mouse down (start drawing the line)
canvas.addEventListener('mousedown', (e) => {
    lineStart = { x: e.offsetX, y: e.offsetY };
    isDrawing = true;
});

// Function to handle mouse move (draw the line as the mouse moves)
canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        lineEnd = { x: e.offsetX, y: e.offsetY };
        drawDots();
        drawLine(lineStart, lineEnd);
    }
});

// Function to handle mouse up (finish drawing the line)
canvas.addEventListener('mouseup', (e) => {
    isDrawing = false;
    if (lineStart && lineEnd) {
        lineEnd = { x: e.offsetX, y: e.offsetY };
        drawLine(lineStart, lineEnd);
        calculateSplit(lineStart, lineEnd);
    }
});

// Function to extend the line beyond the canvas edges
function extendLine(start, end) {
    const slope = (end.y - start.y) / (end.x - start.x);
    
    const extendedStart = { x: 0, y: start.y - slope * start.x };
    const extendedEnd = { x: canvas.width, y: start.y + slope * (canvas.width - start.x) };

    return { extendedStart, extendedEnd };
}

// Function to draw a line and color the sides on the canvas
function drawLine(start, end) {
    const { extendedStart, extendedEnd } = extendLine(start, end);

    // Fill the area above the line
    
    ctx.fillStyle = 'rgba(0, 0, 255, 0.4)'; // Semi-transparent blue
    ctx.beginPath();
    ctx.moveTo(extendedStart.x, extendedStart.y);
    ctx.lineTo(extendedEnd.x, extendedEnd.y);
    ctx.lineTo(canvas.width, extendedEnd.y);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, extendedStart.y);
    ctx.closePath();
    ctx.fill();

    // Fill the area below the line
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; // Semi-transparent red
    ctx.beginPath();
    ctx.moveTo(extendedStart.x, extendedStart.y);
    ctx.lineTo(extendedEnd.x, extendedEnd.y);
    ctx.lineTo(canvas.width, extendedEnd.y);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(0, extendedStart.y);
    ctx.closePath();
    ctx.fill();

    // Draw the line
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(extendedStart.x, extendedStart.y);
    ctx.lineTo(extendedEnd.x, extendedEnd.y);
    ctx.stroke();
}
    
// Function to calculate the dot split based on the drawn line
function calculateSplit(start, end) {
    const { extendedStart, extendedEnd } = extendLine(start, end);
    
    let dotsAbove = 0;
    let dotsBelow = 0;

    const A = extendedEnd.y - extendedStart.y;
    const B = extendedStart.x - extendedEnd.x;
    const C = A * extendedStart.x + B * extendedStart.y;

    dots.forEach(dot => {
        const position = A * dot.x + B * dot.y - C;
        if (position > 0) {
            dotsAbove++;
        } else {
            dotsBelow++;
        }
    });

    const total = dotsAbove + dotsBelow;
    const percentageAbove = (dotsAbove / total) * 100;
    const percentageBelow = (dotsBelow / total) * 100;

    // Calculate the score
    const targetAbove = 80;
    const targetBelow = 20;
    const diffAbove = Math.abs(percentageAbove - targetAbove);
    const diffBelow = Math.abs(percentageBelow - targetBelow);
    // Scale the score such that an undersplit is penalized as much as an oversplit
    const score = 100 - (diffAbove + diffBelow) / 2;

    document.getElementById('result').innerText = `Dots Above: ${percentageAbove.toFixed(2)}%, Dots Below: ${percentageBelow.toFixed(2)}%, Score: ${score.toFixed(2)}`;
}

// Initialize the game
generateDots();
drawDots();
