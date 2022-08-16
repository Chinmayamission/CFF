import ExpressionParser from "../common/ExpressionParser";
import lolex from "lolex";

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
  test("array count equality of items", () => {
    expect(
      ExpressionParser.calculate_price(
        "$offerings.onetimeofferings:ganapatihoma",
        {
          offerings: {
            onetimeofferings: ["panchamritaabhisheka", "ganapatihoma"]
          }
        }
      )
    ).toEqual(1);
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

  describe("cff_createdBetween", () => {
    test("with date_created specified", () => {
      expect(
        ExpressionParser.calculate_price(
          `cff_createdBetween("2019-09-18T16:53:26.238Z", "2019-09-18T18:53:26.238Z")`,
          {},
          true,
          { date_created: { $date: "2019-09-18T16:53:26.238Z" } }
        )
      ).toEqual(1);
      expect(
        ExpressionParser.calculate_price(
          `cff_createdBetween("2019-09-18T16:53:26.238Z", "2019-09-18T18:53:26.238Z")`,
          {},
          true,
          { date_created: { $date: "2019-09-18T16:52:26.238Z" } }
        )
      ).toEqual(0);
      expect(
        ExpressionParser.calculate_price(
          `cff_createdBetween("2019-09-18T16:53:26.238Z", "2019-09-18T18:53:26.238Z")`,
          {},
          true,
          { date_created: { $date: "2019-09-18T18:54:26.238Z" } }
        )
      ).toEqual(0);
    });
    test("with date_created unspecified", () => {
      let clock;
      clock = lolex.install({ now: new Date("2019-09-18T16:53:26.238Z") });
      expect(
        ExpressionParser.calculate_price(
          `cff_createdBetween("2019-09-18T16:53:26.238Z", "2019-09-18T18:53:26.238Z")`,
          {},
          true,
          {}
        )
      ).toEqual(1);
      clock.uninstall();

      clock = lolex.install({ now: new Date("2019-09-18T16:52:26.238Z") });
      expect(
        ExpressionParser.calculate_price(
          `cff_createdBetween("2019-09-18T16:53:26.238Z", "2019-09-18T18:53:26.238Z")`,
          {},
          true,
          {}
        )
      ).toEqual(0);
      clock.uninstall();

      clock = lolex.install({ now: new Date("2019-09-18T18:54:26.238Z") });
      expect(
        ExpressionParser.calculate_price(
          `cff_createdBetween("2019-09-18T16:53:26.238Z", "2019-09-18T18:53:26.238Z")`,
          {},
          true,
          {}
        )
      ).toEqual(0);
      clock.uninstall();
    });
  });
});

describe("performMongoQuery", () => {
  test("run aggregate with case statements", () => {
    const queryValue = [
      {
        $project: {
          n: {
            $switch: {
              branches: [
                { case: { $lt: ["$age", 18] }, then: "Child" },
                { case: { $lt: ["$age", 29] }, then: "CHYK" },
                { case: { $lt: ["$age", 41] }, then: "Setukari" }
              ],
              default: "Adult"
            }
          }
        }
      }
    ];
    expect(
      ExpressionParser.performMongoQuery(
        { age: 39 },
        { queryType: "aggregate", queryValue }
      )
    ).toEqual("Setukari");
  });
});
