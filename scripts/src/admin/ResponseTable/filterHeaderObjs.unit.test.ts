import filterHeaderObjects from "./filterHeaderObjs";

test('filter header objs', () => {
  let initialHeaderObjs = [{"id": "PAID"}, {"id": "name.first"}, {"id": "ID"}, {"id": "name.last"}, {"id": "email"}];
  let dataOption = {"columnOrder": ["name.last", "name.first"]} 
  let expectedResult = [{"id": "name.last"}, {"id": "name.first"}, {"id": "PAID"}, {"id": "ID"}, {"id": "email"}];
  expect(filterHeaderObjects(initialHeaderObjs, dataOption)).toEqual(expectedResult);
});