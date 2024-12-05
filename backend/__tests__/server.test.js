const request = require('supertest');
const server = require('../server');

describe('Tests for the server', () => {
  it('Should return a success message on the GET route /', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Backend is working!');
  });
});

describe('POST /processRoverInstructions - Validating Positions and Instructions', () => {
  it('Should return a 400 error for invalid statements.', async () => {
    const requestBody = {
      initialPosition: '0 0 N',
      instructions: 'ABCD',
      maxCoordinateX: 5,
      maxCoordinateY: 5,
    };

    const res = await request(server)
      .post('/processRoverInstructions')
      .send(requestBody);

    expect(res.statusCode).toBe(400);
  });

  it('Should return error if starting position has incorrect format', async () => {
    const response = await request(server)
      .post('/processRoverInstructions')
      .send({
        initialPosition: "0 0",
        instructions: "MM",
        maxCoordinateX: 5,
        maxCoordinateY: 5
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid format for starting position. Example: "0 0 N".');
  });

  it('Should return error if coordinates are invalid.', async () => {
    const response = await request(server)
      .post('/processRoverInstructions')
      .send({
        initialPosition: "0 0 Z",
        instructions: "MM",
        maxCoordinateX: 5,
        maxCoordinateY: 5
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid direction. Valid directions are: N, E, S, W.');
  });

  it('Should return error if instructions contain invalid characters.', async () => {
    const response = await request(server)
      .post('/processRoverInstructions')
      .send({
        initialPosition: "0 0 N",
        instructions: "MLXZ",
        maxCoordinateX: 5,
        maxCoordinateY: 5
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid instructions. Only the characters L, R and M are allowed.');
  });

  it('Should return error if instructions are empty.', async () => {
    const response = await request(server)
      .post('/processRoverInstructions')
      .send({
        initialPosition: "0 0 N",
        instructions: "", 
        maxCoordinateX: 5,
        maxCoordinateY: 5
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid instructions. Only the characters L, R and M are allowed.');
  });

  it('Should return error if starting position is not number.', async () => {
    const response = await request(server)
      .post('/processRoverInstructions')
      .send({
        initialPosition: "A A N",
        instructions: "MM",
        maxCoordinateX: 5,
        maxCoordinateY: 5
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('The X and Y coordinates must be integers.');
  });

  it('Should return error if coordinates exceed limits.', async () => {
    const response = await request(server)
      .post('/processRoverInstructions')
      .send({
        initialPosition: "6 6 N",
        instructions: "MM",
        maxCoordinateX: 5,
        maxCoordinateY: 5
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Coordinates must be within the limits: X [0, 5], Y [0, 5].');
  });
});

describe('POST /processRoverInstructions - Rover Movement', () => {
  it('Must correctly process instructions from the rover.', async () => {
    const requestBody = {
      initialPosition: '1 2 N',
      instructions: 'LMLMLMLMM',
      maxCoordinateX: 5,
      maxCoordinateY: 5,
    };

    const res = await request(server)
      .post('/processRoverInstructions')
      .send(requestBody);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Final position: 1 3 N');
  });

  it('Must validate that the rover does not exceed the grid limits.', async () => {
    const requestBody = {
      initialPosition: '4 4 E',
      instructions: 'MM',
      maxCoordinateX: 5,
      maxCoordinateY: 5,
    };

    const res = await request(server)
      .post('/processRoverInstructions')
      .send(requestBody);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Final position: 5 4 E');
  });
});

describe('POST /processRoverInstructions - Direction Rotation.', () => {
  it('Must rotate the rover to the left', async () => {
    const response = await request(server)
      .post('/processRoverInstructions')
      .send({
        initialPosition: "0 0 N",
        instructions: "L",
        maxCoordinateX: 5,
        maxCoordinateY: 5
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Final position: 0 0 W');
  });

  it('Must rotate the rover to the right.', async () => {
    const response = await request(server)
      .post('/processRoverInstructions')
      .send({
        initialPosition: "0 0 N",
        instructions: "R",
        maxCoordinateX: 5,
        maxCoordinateY: 5
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Final position: 0 0 E');
  });

  it('It should rotate several times correctly (example MRRMMRMRRM).', async () => {
    const response = await request(server)
      .post('/processRoverInstructions')
      .send({
        initialPosition: "3 3 E",
        instructions: "MRRMMRMRRM",
        maxCoordinateX: 5,
        maxCoordinateY: 5
      });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Final position: 2 3 S');
  });
});
