require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT;
const cors = require('cors');
const bodyParser = require('body-parser');
const winston = require('winston');

app.use(cors());
app.use(bodyParser.json());

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

const validateInitialPosition = (position, maxX, maxY) => {
  const cleanedPosition = position.replace(/[\s,]+/g, ' ').trim();
  const parts = cleanedPosition.split(' ');

  if (parts.length !== 3) {
    return { valid: false, message: 'Invalid format for starting position. Example: "0 0 N".' };
  }

  const [x, y, direction] = parts;
  const xInt = parseInt(x);
  const yInt = parseInt(y);

  if (isNaN(xInt) || isNaN(yInt)) {
    return { valid: false, message: 'The X and Y coordinates must be integers.' };
  }

  if (xInt < 0 || xInt > maxX || yInt < 0 || yInt > maxY) {
    return { valid: false, message: `Coordinates must be within the limits: X [0, ${maxX}], Y [0, ${maxY}].` };
  }

  if (!['N', 'E', 'S', 'W'].includes(direction.toUpperCase())) {
    return { valid: false, message: 'Invalid direction. Valid directions are: N, E, S, W.' };
  }

  return { valid: true };
};

const validateInstructions = (instructions) => {
  const cleanedInstructions = instructions.replace(/[\s,]+/g, '').toUpperCase().trim();
  if (!/^[LRM]+$/.test(cleanedInstructions)) {
    return { valid: false, message: 'Invalid instructions. Only the characters L, R and M are allowed.' };
  }
  return { valid: true };
};

app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.post('/processRoverInstructions', (req, res) => {
  const {initialPosition, instructions, maxCoordinateX, maxCoordinateY} = req.body;

  const positionValidation = validateInitialPosition(initialPosition, maxCoordinateX, maxCoordinateY);
  if (!positionValidation.valid) {
    return res.status(400).json({ message: positionValidation.message });
  }

  const instructionsValidation = validateInstructions(instructions);
  if (!instructionsValidation.valid) {
    return res.status(400).json({ message: instructionsValidation.message });
  }

  const cleanedPosition = initialPosition.replace(/[\s,]+/g, ' ').trim();
  const [initialX, initialY, initialDirection] = cleanedPosition.split(' ');

  let x = parseInt(initialX);
  let y = parseInt(initialY);
  let direction = initialDirection.toUpperCase();

  const rotateRover = (direction, turn) => {
    const directions = ['N', 'E', 'S', 'W'];
    let index = directions.indexOf(direction);
    if (turn === 'L') {
      index = (index + 3) % 4;
    } else if (turn === 'R') {
      index = (index + 1) % 4;
    }
    return directions[index];
  };

  const cleanedInstructions = instructions.replace(/[\s,]+/g, '').trim().toUpperCase();
  const instructionList = cleanedInstructions.split('');

  for (let i = 0; i < instructionList.length; i++) {
    const instruction = instructionList[i];
    if (instruction === 'L' || instruction === 'R') {
      direction = rotateRover(direction, instruction);
    } else if (instruction === 'M') {
      if (direction === 'N' && y < maxCoordinateY) {
        y += 1;
      } else if (direction === 'S' && y > 0) {
        y -= 1;
      } else if (direction === 'E' && x < maxCoordinateX) {
        x += 1;
      } else if (direction === 'W' && x > 0) {
        x -= 1;
      }
    }
  }

  res.json({
    message: `Final position: ${x} ${y} ${direction}`,
  });
});

const server = app.listen(port, () => {
  logger.info(`Backend running on the port ${port}`);
});

module.exports = server;