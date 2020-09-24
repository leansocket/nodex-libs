import { hash, 
        sha256, 
        encode_aes_256_cbc, 
        decode_aes_256_cbc, 
        encode_base64,
        decode_base64,
        encode_hex64,
        decode_hex64 } from '../src/crypto';

test("test hash function", () => {
  let p = hash("md5", "123456");
  expect(p).toBe("e10adc3949ba59abbe56e057f20f883e");
})

test("test sha256 function", () => {
  let p = sha256("123456");
  expect(p).toBe("8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92");
})

test("test encode_aes_256_cbc function", () => {
  let p = encode_aes_256_cbc("123456", "123456");
  expect(p).toBe("ce0a996b2cf0f65c71f6658c8704cd25");
})

test("test decode_aes_256_cbc function", () => {
  let p = decode_aes_256_cbc("123456", "ce0a996b2cf0f65c71f6658c8704cd25");
  expect(p).toBe("123456");
})

test("test encode_base64 function", () => {
  let p = encode_base64("123456");
  expect(p).toBe("MTIzNDU2");
})

test("test decode_base64 function", () => {
  let p = decode_base64("MTIzNDU2");
  expect(p).toBe("123456");
})

test("test encode_hex64 function", () => {
  let p = encode_hex64("123456");
  expect(p).toBe("EjRW");
})

test("test decode_hex64 function", () => {
  let p = decode_hex64("EjRW");
  expect(p).toBe("123456");
})
