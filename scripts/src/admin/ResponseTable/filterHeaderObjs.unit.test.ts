import filterHeaderObjects from "./filterHeaderObjs";

let initialHeaderObjs = [{"id": "PAID"}, {"id": "name.first"}, {"id": "ID"}, {"id": "name.last"}, {"id": "email"}];
test('filter header objs normal', () => {
  let dataOption = {"columnOrder": ["name.last", "name.first"]} 
  let expectedResult = [{"id": "name.last"}, {"id": "name.first"}];
  expect(filterHeaderObjects(initialHeaderObjs, dataOption)).toEqual(expectedResult);
});

test('filter header objs with wildcard at end', () => {
  let dataOption = {"columnOrder": ["name.last", "name.first", "*"]} 
  let expectedResult = [{"id": "name.last"}, {"id": "name.first"}, {"id": "PAID"}, {"id": "ID"}, {"id": "email"}];
  expect(filterHeaderObjects(initialHeaderObjs, dataOption)).toEqual(expectedResult);
});

test('filter header objs wildcard front', () => {
  let dataOption = {"columnOrder": ["*", "name.last", "name.first"]} 
  let expectedResult = [{"id": "PAID"}, {"id": "ID"}, {"id": "email"}, {"id": "name.last"}, {"id": "name.first"}];
  expect(filterHeaderObjects(initialHeaderObjs, dataOption)).toEqual(expectedResult);
});

test('filter header objs wildcard middle', () => {
  let dataOption = {"columnOrder": ["name.last", "*", "name.first"]} 
  let expectedResult = [{"id": "name.last"}, {"id": "PAID"}, {"id": "ID"}, {"id": "email"}, {"id": "name.first"}];
  expect(filterHeaderObjects(initialHeaderObjs, dataOption)).toEqual(expectedResult);
});

test('filter header objs with undefined header name', () => {
  let dataOption = {"columnOrder": ["name.last", "name.first", "BLAH"]} 
  let expectedResult = [{"id": "name.last"}, {"id": "name.first"}];
  expect(filterHeaderObjects(initialHeaderObjs, dataOption)).toEqual(expectedResult);
});