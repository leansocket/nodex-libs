import { decompress, decode, escape } from "../src/html";
import { gzipSync } from 'zlib'

test("test decompress function", async () => {

  const response = await decompress({
    status: 200,
    headers: {},
    content: 'text'
  });

  expect(response.content).toBe("text")

  const gzipResponse = await decompress({
    status: 200,
    headers: {
      "Content-Encoding": "gzip"
    },
    content: gzipSync('text')
  })

  expect(gzipResponse.content.toString()).toBe("text")

});

test("test decode function", async () => {

  const res = await decode({
    status: 200,
    headers: {
      "content-type": "text/plain,charset=utf-8"
    },
    content: "test"
  });

  expect(res.content).toBe("test");

})

test("test escape function", async () => {

  expect((await escape("&")).toString()).toBe("&amp;");

  expect((await escape("<")).toString()).toBe("&lt;");

})