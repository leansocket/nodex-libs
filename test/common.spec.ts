import { error } from '../src/common';

test('Check common module.', () => {
  const NAME = 'ERR_TEST_ERROR'
  const MESSAGE = 'The test error'
  const err = error(NAME, MESSAGE)
  expect(err instanceof Error).toBeTruthy()
  expect(err.name).toBe(NAME)
  expect(err.message).toBe(MESSAGE)
});