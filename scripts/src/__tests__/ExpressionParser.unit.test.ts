import ExpressionParser from "../common/ExpressionParser";

test("dict array to sum dict", () => {
  expect(
    ExpressionParser.dict_array_to_sum_dict([{ a: 2, b: 5 }, { a: 1, b: 6 }])
  ).toEqual({ a: 3.0, b: 11.0 });
  expect(
    ExpressionParser.dict_array_to_sum_dict([{ a: 2, b: 5 }, { a: 1 }])
  ).toEqual({ a: 3.0, b: 5.0 });
});

describe("calculate_price", () => {
  test("basic", () => {
    expect(ExpressionParser.calculate_price("x * 12", { x: 1 })).toEqual(12.0);
  });
  test("array length", () => {
    expect(
      ExpressionParser.calculate_price("participants * 25", {
        participants: [1, 2, 3]
      })
    ).toEqual(75);
  });
  test("array calculations", () => {
    expect(
      ExpressionParser.calculate_price(
        "2 * sponsorshipAnnadaanam:300 + sponsorshipAnnadaanam:600",
        { sponsorshipAnnadaanam: [300, 600] }
      )
    ).toEqual(3);
  });
  test("array calculations subtraction", () => {
    expect(
      ExpressionParser.calculate_price("$participants - $participants.age:1", {
        participants: [{ age: 10 }, { age: 1 }]
      })
    ).toEqual(1);
    expect(
      ExpressionParser.calculate_price(
        "1.0 * ($participants - $participants.age:1)",
        { participants: [{ age: 10 }, { age: 1 }] }
      )
    ).toEqual(1);
  });
  test("array calculations with multiple subtraction", () => {
    expect(
      ExpressionParser.calculate_price(
        "$participants - $participants.age:1 - $participants.age:2 - $participants.age:3 + $participants - $participants.age:1 - $participants.age:2 - $participants.age:3",
        { participants: [{ age: 10 }, { age: 1 }, { age: 2 }] }
      )
    ).toEqual(2);
  });
  test("array calculations with multiple, repeated subtraction", () => {
    expect(
      ExpressionParser.calculate_price(
        "$participants - $participants.age:1 - $participants.age:2 - $participants.age:3",
        { participants: [{ age: 10 }, { age: 1 }, { age: 2 }] }
      )
    ).toEqual(1);
  });
  test("yeardiff function", () => {
    expect(
      ExpressionParser.calculate_price("cff_yeardiff('2019-09-01', dob)", {
        dob: "1999-01-02"
      })
    ).toEqual(20);
  });
  test("using countArray to apply yeardiff for property within array of objects", () => {
    expect(
      ExpressionParser.calculate_price(
        "cff_countArray(CFF_FULL_participants, \"cff_yeardiff('2019-09-01', dob) > 2\")",
        {
          participants: [
            { dob: "1999-01-02" },
            { dob: "2019-01-02" },
            { dob: "2018-01-02" }
          ]
        }
      )
    ).toEqual(1);
  });
  test("countArray yeardiff should work when value is undefined", () => {
    expect(
      ExpressionParser.calculate_price(
        "cff_countArray(CFF_FULL_participants, \"cff_yeardiff('2019-09-01', dob) > 2\")",
        {}
      )
    ).toEqual(0);
  });
  test("round up to next cent", () => {
    expect(ExpressionParser.calculate_price("1 / 3 ", {})).toEqual(0.34);
  });
  test("return numeric", () => {
    expect(ExpressionParser.calculate_price("a", { a: [1, 2, 3] })).toEqual(3);
  });
  test("return non-numeric", () => {
    expect(
      ExpressionParser.calculate_price("a", { a: [1, 2, 3] }, false)
    ).toEqual(3);
    expect(
      ExpressionParser.calculate_price("CFF_FULL_a", { a: [1, 2, 3] }, false)
    ).toEqual([1, 2, 3]);
  });
});
