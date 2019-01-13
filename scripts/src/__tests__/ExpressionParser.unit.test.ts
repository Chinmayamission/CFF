import ExpressionParser from "../common/ExpressionParser";

test('dict array to sum dict', () => {
  expect(ExpressionParser.dict_array_to_sum_dict([{"a":2, "b":5}, {"a":1, "b":6}])).toEqual({'a': 3.00, 'b': 11.00});
  expect(ExpressionParser.dict_array_to_sum_dict([{"a":2, "b":5}, {"a":1}])).toEqual({'a': 3.00, 'b': 5.00});
});