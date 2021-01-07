import {
  ChartSchema,
  ChartModel,
  ChartVariableModel,
} from "../../schemas/ChartSchema";
import {
  VariableDefinitionSchema,
  VariableDefinitionModel,
} from "../../schemas/VariableDefinitionSchema";
import { SchoolSchema } from "../../schemas/SchoolSchema";
import { SchoolDataSchema } from "../../schemas/SchoolDataSchema";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "lodash";

chai.use(chaiAsPromised);
const assert = chai.assert;

//todo: clean up all this unneeded fixture stuff, can just get your document with new(testObj) instead of fetching

describe("Chart Schema", function () {
  const testVar1: VariableDefinitionModel = {
    variable: "test_var_1",
    valueType: "currency",
    friendlyName: "asddd",
    category: "",
    sources: [
      {
        startYear: "2015",
        endYear: "2017",
        source: "IPEDS",
        table: "test_ipeds_table",
        formula: "source formula doesn't matter",
        definition: "test definition",
        notes: "some test notes",
      },
    ],
  };

  const testVar2: VariableDefinitionModel = {
    variable: "test_var_2",
    valueType: "currency0",
    friendlyName: "ddddddd",
    category: "",
    sources: [
      {
        startYear: "2015",
        endYear: "2017",
        source: "IPEDS",
        table: "test_ipeds_table",
        formula: "source formula doesn't matter",
        definition: "test definition",
        notes: "some test notes",
      },
    ],
  };

  const testChart: ChartModel = {
    name: "fake_chart",
    type: "line",
    slug: "the-slug",
    category: "fake",
    active: true,
    valueType: "currency",
    cuts: [],
    description: "sweet chart",
    variables: [],
  };

  const testChartVariableGood: ChartVariableModel = {
    formula: "1+test_var_1",
    notes: "test notes",
    legendName: "test legend",
  };

  const testChartVariableGood2: ChartVariableModel = {
    formula: "1+test_var_2",
    notes: "test notes",
    legendName: "test legend",
  };

  //this is bad because of nonexistent variable in the formula
  const testChartVariableBad: ChartVariableModel = {
    formula: "1+2 + fake_var",
    notes: "bad test notes",
    legendName: "bad test legend",
  };

  /*   describe("fail validation by updating empty chart with a variable that has an invalid formula", function () {
    it("should return without error", function () {
      const model = new ChartSchema(testChart),
        newVar = <any>testChartVariableBad; //cast to any to avoid typescript error
      model.variables.push(newVar);
      return assert.isRejected(
        model.validate(),
        "chart validation failed: variables.0.formula: Variable formula is invalid!"
      );
    });
  });

  describe("fail validation via static update method by filling empty chart with a variable that has an invalid formula", function () {
    it("should return without error", function () {
      const model = new ChartSchema(testChart),
        updateModel = testChart,
        newVar = <any>testChartVariableBad;
      updateModel.variables.push(newVar);
      return assert.isRejected(
        model.schema.statics.fetchAndUpdate(updateModel),
        "chart validation failed: variables.0.formula: Variable formula is invalid!"
      );
    });
  });

  describe("pass validation by updating empty chart with a variable that has a valid formula", function () {
    it("should return without error", function () {
      testChart.variables = []; //reset...
      const model = new ChartSchema(testChart),
        newVar = <any>testChartVariableGood;
      model.variables.push(newVar);
      return assert.isFulfilled(model.validate());
    });
  });

  describe("use static update to change an extant variable", function () {
    it("should return without error", function (done) {
      testChart.variables = []; //reset...
      const model = new ChartSchema(testChart),
        newVar = <any>testChartVariableGood;
      model.variables.push(newVar);
      model
        .save()
        .then(() => ChartSchema.findById(model._id))
        .then((model) => {
          model.category = "updated category";
          model.variables[0].notes = "New updated notes";
          model.variables.push(<any>testChartVariableGood2);
          return model;
        })
        .then((model) => {
          return model.schema.statics.fetchAndUpdate(model);
        })
        .then((res: ChartModel) => {
          assert.equal(res.category, "updated category");
          assert.equal(res.variables.length, 2);
          assert.equal(res.variables[0].notes, "New updated notes");
          done();
        })
        .catch((err: Error) => done(err));
    });
  }); */
});
