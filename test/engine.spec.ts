import { RuleEngine } from "../src";
import { Operator } from "../src/types/rule";
import { simpleValidJson } from "./rulesets/simple-valid.json";
import { nestedValidJson } from "./rulesets/nested-valid.json";
import { nestedInValidJson } from "./rulesets/nested-invalid.json";

describe("RuleEngine Unit Tests", () => {
  it("Correctly validates a good ruleset", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          { all: [{ field: "name", operator: Operator.Equal, value: "test" }] },
        ],
      }).isValid
    ).toEqual(true);
  });

  it("Correctly identifies a bad operator", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          { all: [{ field: "name", operator: "*", value: "test" }] },
        ],
      }).isValid
    ).toEqual(false);
  });

  it("Correctly identifies an invalid ruleset", () => {
    const validation = RuleEngine.validate(nestedInValidJson);

    expect(validation.isValid).toEqual(false);
    expect(validation.error.message).toEqual(
      "Nested conditions cannot have a result property."
    );
  });

  it("Detects invalid values for In/Not In operators", () => {
    expect(
      RuleEngine.validate({
        conditions: [
          { all: [{ field: "name", operator: Operator.In, value: "test" }] },
        ],
      }).isValid
    ).toEqual(false);

    expect(
      RuleEngine.validate({
        conditions: [
          { all: [{ field: "name", operator: Operator.NotIn, value: "test" }] },
        ],
      }).isValid
    ).toEqual(false);
  });

  it("Correctly validates a simple ruleset", () => {
    expect(RuleEngine.validate(simpleValidJson).isValid).toEqual(true);
  });

  it("Correctly evaluates a simple ruleset", () => {
    expect(
      RuleEngine.evaluate(simpleValidJson, { ProfitPercentage: 20 })
    ).toEqual(true);
    expect(
      RuleEngine.evaluate(simpleValidJson, { ProfitPercentage: 2 })
    ).toEqual(false);
    expect(
      RuleEngine.evaluate(simpleValidJson, {
        WinRate: 80,
        AverageTradeDuration: 5,
        Duration: 9000000,
      })
    ).toEqual(false);
    expect(
      RuleEngine.evaluate(simpleValidJson, {
        WinRate: 80,
        AverageTradeDuration: 5,
        Duration: 9000000,
        TotalDaysTraded: 5,
      })
    ).toEqual(true);
  });

  it("Correctly validates a nested ruleset", () => {
    expect(RuleEngine.validate(nestedValidJson).isValid).toEqual(true);
  });

  it("Correctly evaluates a nested ruleset", () => {
    expect(RuleEngine.evaluate(nestedValidJson, {})).toEqual(2);
    expect(
      RuleEngine.evaluate(nestedValidJson, { Category: "Islamic" })
    ).toEqual(4);
    expect(
      RuleEngine.evaluate(nestedValidJson, { Monetization: "Real" })
    ).toEqual(2);
    expect(RuleEngine.evaluate(nestedValidJson, { Leverage: 1000 })).toEqual(3);
    expect(RuleEngine.evaluate(nestedValidJson, { Leverage: 999 })).toEqual(2);
    expect(
      RuleEngine.evaluate(nestedValidJson, {
        Monetization: "Real",
        Leverage: 150,
        CountryIso: "FI",
      })
    ).toEqual(3);
    expect(
      RuleEngine.evaluate(nestedValidJson, {
        Monetization: "Real",
        Leverage: 150,
        CountryIso: "FI",
        foo: "bar",
        another: false,
      })
    ).toEqual(3);
  });
});
