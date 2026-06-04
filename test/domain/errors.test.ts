import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ValidationError, ImportError } from '../../src/domain/errors.ts';

test('ValidationError carries issues and a joined message', () => {
  const e = new ValidationError([{ path: 'tracks[0].id', msg: 'required' }]);
  assert.ok(e instanceof Error);
  assert.equal(e.name, 'ValidationError');
  assert.equal(e.message, 'tracks[0].id: required');
  assert.deepEqual(e.issues, [{ path: 'tracks[0].id', msg: 'required' }]);
});
test('ImportError is an Error with a name', () => {
  const e = new ImportError('bad json');
  assert.ok(e instanceof Error);
  assert.equal(e.name, 'ImportError');
  assert.equal(e.message, 'bad json');
});
