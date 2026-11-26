import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// Ignore CSS imports
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.css')) {
      return {
        format: 'module',
        source: '',
        shortCircuit: true
      };
    }
    return nextLoad(url, context);
  }
});

// Mock browser environment
globalThis.document = {
  querySelector: () => ({
    getContext: () => ({}),
    addEventListener() {}
  })
};

globalThis.window = {
  addEventListener() {}
};

globalThis.requestAnimationFrame = () => 0;

const {
  createBoard,
  createPiece,
  rotate,
  collision
} = await import('../src/main.ts');

test('Empty board has 20 rows and 10 columns', () => {
  const board = createBoard();

  assert.equal(board.length, 20);
  assert.ok(board.every(row =>
    row.length === 10 &&
    row.every(cell => cell === null)
  ));
});

test('O piece spawns centered', () => {
  assert.deepEqual(createPiece('O'), {
    type: 'O',
    matrix: [[1, 1], [1, 1]],
    x: 4,
    y: 0
  });
});

test('Rotation turns a horizontal piece vertical', () => {
  assert.deepEqual(
    rotate([[1, 1, 1, 1]]),
    [[1], [1], [1], [1]]
  );
});

test('Collision detects walls and floor', () => {
  const piece = createPiece('O');

  assert.equal(collision(piece), false);
  assert.equal(collision(piece, -5), true);
  assert.equal(collision(piece, 5), true);
  assert.equal(collision(piece, 0, 19), true);
});