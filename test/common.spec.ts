import { error, checkError } from "../src/common";

test("Check common module.", () => {
  const NAME = "ERR_TEST_ERROR";
  const MESSAGE = "The test error";
  const err = error(NAME, MESSAGE);
  expect(err instanceof Error).toBeTruthy();
  expect(err.name).toBe(NAME);
  expect(err.message).toBe(MESSAGE);

  expect(checkError(err)).toBeTruthy();
  expect(checkError(null, { result: "ok" })).toBeFalsy();
  expect(checkError(null, { result: true })).toBeFalsy();
  expect(checkError(null, { result: 0 })).toBeFalsy();
  expect(checkError(null, { result: "err" })).toBeTruthy();
  expect(checkError(null, {})).toBeFalsy();
});
