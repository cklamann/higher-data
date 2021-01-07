/// <reference types="mocha" />

import { FormulaParser } from "../../modules/FormulaParser";
import assert = require("assert");

const optionalFormula: string = "__opt_tuition + room_and_board";

const testData = [
  { variable: "room_and_board", fiscal_year: "2010", value: 10 },
  { variable: "room_and_board", fiscal_year: "2011", value: 10 },
  { variable: "tuition", fiscal_year: "2010", value: 10 },
  { variable: "tuition", fiscal_year: "2011", value: 10 },
];

describe("#FORMULA PARSER", function () {
  describe("test that parser strips __opt_ prefix", function () {
    it("should return a cleaned formula from one with optional arguments", function (done) {
      let form1 = new FormulaParser("__opt_room_and_board + hat");
      assert(form1.cleanFormula == "room_and_board + hat");
      done();
    });
  });

  describe("test that optional symbol nodes exist", function () {
    it("should return optional symbol nodes as clean variables", function (done) {
      let form1 = new FormulaParser("__opt_room_and_board + cow");
      assert(form1.optionalSymbolNodes[0] == "room_and_board");
      done();
    });
  });

  describe("return a variable with no math involved", function () {
    it("should return the expected amount", function (done) {
      const formula = "room_and_board",
        data = [
          { variable: "room_and_board", fiscal_year: "2010", value: 10 },
          { variable: "room_and_board", fiscal_year: "2011", value: 10 },
        ],
        form1 = new FormulaParser(formula);
      assert(form1.getVariables()[0] === formula);
      assert.deepEqual(
        form1.evaluate(data),
        data.map((d) => ({ fiscal_year: d.fiscal_year, value: d.value }))
      );
      done();
    });
  });

  describe("transform the data with some simple arithmetic", function () {
    it("should return tuition plus room and board", function (done) {
      const formula = "room_and_board + tuition",
        form1 = new FormulaParser(formula);
      assert(form1.getVariables().includes("room_and_board"));
      assert(form1.getVariables().includes("tuition"));
      assert.deepEqual(form1.evaluate(testData), [
        { fiscal_year: "2010", value: 20 },
        { fiscal_year: "2011", value: 20 },
      ]);
      done();
    });
  });

  describe("test optional variable where value exists", function () {
    it("should return correct result for present optional variable", function (done) {
      const formula = new FormulaParser(optionalFormula);
      assert.deepEqual(formula.evaluate(testData), [
        { fiscal_year: "2010", value: 20 },
        { fiscal_year: "2011", value: 20 },
      ]);
      done();
    });
  });

  describe("test optional variable where value does not exist", function () {
    it("should return data with missing optional data filled in as zeroes", function (done) {
      const formula = new FormulaParser(optionalFormula);

      assert.deepEqual(
        formula.evaluate(
          testData.filter(
            (datum) =>
              datum.fiscal_year !== "2011" || datum.variable != "tuition"
          )
        ),
        [
          { fiscal_year: "2010", value: 20 },
          { fiscal_year: "2011", value: 10 },
        ]
      );
      done();
    });
  });

  describe("test missing variables", function () {
    it("should return an empty array", function (done) {
      const formula = new FormulaParser("room_and_board + nonexistant");
      assert.deepEqual(formula.evaluate(testData), []);
      done();
    });
  });

  describe("test missing year", function () {
    it("should return 1 year worth of data because one was filtered out", function (done) {
      const formula = new FormulaParser("room_and_board + tuition");
      assert.equal(
        formula.evaluate(
          testData.filter(
            (datum) =>
              datum.fiscal_year !== "2011" || datum.variable !== "tuition"
          )
        ).length,
        1
      );
      done();
    });
  });
});
