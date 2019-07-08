import ExpressionParser from "../common/ExpressionParser";

test('dict array to sum dict', () => {
  expect(ExpressionParser.dict_array_to_sum_dict([{"a":2, "b":5}, {"a":1, "b":6}])).toEqual({'a': 3.00, 'b': 11.00});
  expect(ExpressionParser.dict_array_to_sum_dict([{"a":2, "b":5}, {"a":1}])).toEqual({'a': 3.00, 'b': 5.00});
});

describe('calculate_price', () => {
  test('basic', () => {
    expect(ExpressionParser.calculate_price("x * 12", {"x": 1})).toEqual(12.0);
  });
  test('array length', () => {
    expect(ExpressionParser.calculate_price("participants * 25", {"participants": [1,2,3]})).toEqual(75);
  });
  test('array calculations', () => {
    expect(ExpressionParser.calculate_price("2 * sponsorshipAnnadaanam:300 + sponsorshipAnnadaanam:600", {"sponsorshipAnnadaanam": [300, 600]})).toEqual(3);
  });
  test('other', () => {
    const expr = "(participants - participants.race:10K) * 25";
    const data = {"participants": [{"bib_name": "as", "race": "5K - OK"}, {"bib_name": "32", "race": "5K - OK"}, {"bib_name": "250", "race": "10K"}]};
    expect(ExpressionParser.calculate_price(expr, data)).toEqual(50.0);
  })
  test('array calculations subtraction', () => {
    expect(ExpressionParser.calculate_price("$participants - $participants.age:1", {"participants": [{age: 10}, {age: 1}]})).toEqual(1);
  });
  // todo: add more tests here.
})