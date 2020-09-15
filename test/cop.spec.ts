import { make } from '../src/cop';

test('Test make function', () => {
  
  let objErr = new Error(); 
  objErr.name = undefined;
  let objVal = make(objErr);    
  expect(objVal.result).toBe('ERR_UNKNOWN');

  let objErr2 = new Error();
  objErr2.name = 'Err_format';
  let objVal5 = make(objErr2);
  expect(objVal5.result).toBe('ERR_FORMAT');

  let objErr3 = new Error();
  objErr3.name = 'Er_format';
  let objVal6 = make(objErr3);
  expect(objVal6.result).toBe('ERR_FORMAT');

  let objErr4 = new Error();
  objErr4.name = 'ERROR_format';
  let objVal7 = make(objErr4);
  expect(objVal7.result).toBe('ERR_FORMAT');
    
  let objErr5 = new Error();
  objErr5.name = 'format';
  let objVal8 = make(objErr5);
  expect(objVal8.result).toBe('ERR_FORMAT');

  let arg0 = 'test' || undefined;
  let objVal2 = make(arg0);
  expect(objVal2.result).toBe('ok');
  expect(objVal2.data).toBe('test');

  let objVal3 = make(undefined, arg0);
  expect(objVal3.result).toBe('ok');
  expect(objVal3.data).toBe('test');

  let objVal4 = make(undefined);
  expect(objVal4.result).toBe('ERR_INVALID_COPDATA');
  expect(objVal4.data).toBe('data of COP is invalid.');
})