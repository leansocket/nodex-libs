import path from "path";
import {
  camelCase,
  camelCaseKeys,
  computeGeoDistance,
  compareVersion,
  absolutePath,
} from "../src/util";

test("test camelCase function", () => {
  let val = camelCase("get_user_info");
  let val2 = camelCase("_get_user_info");
  expect(val).toBe("getUserInfo");
  expect(val2).toBe("GetUserInfo");
});

test("test camelCaseKeys function", () => {
  let obj = {
    get_user_info: "zpw",
    get_list: "zpw",
  };
  let retVal = camelCaseKeys(obj);
  let arr = [];

  for (const key in retVal) {
    arr.push(key);
  }

  expect(arr[0]).toBe("getUserInfo");
  expect(arr[1]).toBe("getList");
});

test("test compareVersion function", () => {
  let zero = compareVersion("6.3", "6.3");  
  let lessThan = compareVersion("6.2", "6.3");  
  let greaterThan = compareVersion("6.5", "6.4");
  let A = compareVersion("");
  let B = compareVersion("6.5.6", "6.5");
  let C = compareVersion("6.5", "6.5.6");

  expect(zero).toBe(0);
  expect(lessThan).toBe(1);
  expect(greaterThan).toBe(-1);
  expect(A).toBe(1);
  expect(B).toBe(-1);
  expect(C).toBe(1);
});

test("test computeGeoDistance function", () => {
  let distance = computeGeoDistance(10, 10, 20, 20);
  expect(distance).toBe(1546.4880483491936);
});

test("test absolutePath function", () => {
  const p = absolutePath("/test/util.spec.ts");
  expect(p).toBe(path.resolve(process.cwd(), "/test/util.spec.ts"));
});
