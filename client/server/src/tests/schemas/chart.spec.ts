import { ChartSchema, ChartVariableSchema, intChartModel, intChartVariableModel } from '../../schemas/ChartSchema';
import { nwData, dummyChartData } from '../fixtures/fixtures';
import { VariableDefinitionSchema, intVariableDefinitionSchema, intVariableDefinitionModel } from '../../schemas/VariableDefinitionSchema';
import { SchoolSchema } from '../../schemas/SchoolSchema';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
import * as _ from 'lodash';
const app = require('../../app');

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('Chart Schema', function() {

  const testVar1: intVariableDefinitionModel = {
    variable: "test_var_1",
    type: "currency",
    sources: [{
      start_year: 2015,
      end_year: 2017,
      source: "IPEDS",
      table: "test_ipeds_table",
      formula: "source formula doesn't matter",
      definition: "test definition",
      notes: "some test notes"
    }]
  }

  const testVar2: intVariableDefinitionModel = {
    variable: "test_var_2",
    type: "currency",
    sources: [{
      start_year: 2015,
      end_year: 2017,
      source: "IPEDS",
      table: "test_ipeds_table",
      formula: "source formula doesn't matter",
      definition: "test definition",
      notes: "some test notes"
    }]
  }

  before('seed data and create a test school and variables', function(done) {
    nwData.data = nwData.data.concat(dummyChartData);
    SchoolSchema.create(nwData)
      .then(() => {
        return VariableDefinitionSchema.create([testVar1, testVar2]);
      }).then(() => done()).catch((err) => done(err));
  });

  const testChart: intChartModel = {
    name: 'fake_chart',
    type: 'line',
    slug: 'the-slug',
    category: 'fake',
    active: true,
    valueType: 'currency',
    description: 'sweet chart',
    variables: []
  };

  const testChartVariableGood: intChartVariableModel = {
    formula: '1+test_var_1',
    notes: 'test notes',
    legendName: 'test legend'
  }

  //this is bad because of nonexistent variable in the formula
  const testChartVariableBad: intChartVariableModel = {
    formula: '1+2 + fake_var',
    notes: 'bad test notes',
    legendName: 'bad test legend'
  };


  beforeEach('create chart', function(done) {
    ChartSchema.create(testChart)
      .then(() => done())
      .catch(err => done(err));
  });

  afterEach('remove test chart', function(done) {
    ChartSchema.find({ name: { "$in": ["fake_chart", "bad_chart"] } }).remove().exec().then(() => done()).catch(err => done(err));
  });

  describe('test test chart exists', function() {
    it('should return without error', function(done) {
      ChartSchema.findOne({ name: testChart.name })
        .then(res => {
          assert.equal(res.type, testChart.type);
          done();
        });
    });
  });

  describe('update empty chart with a variable', function() {
    it('should return without error', function(done) {
      ChartSchema.findOne({ name: testChart.name })
        .then(model => {
          let newVar = new ChartVariableSchema(testChartVariableGood);
          model.variables = model.variables.concat(newVar); //$pushall problem...
          model.save()
            .then(res => ChartSchema.findOne({ _id: model._id }).exec())
            .then(updated => {
              assert(updated.variables[0].formula === testChartVariableGood.formula);
              done();
            })
            .catch(err => done(err));
        });
    });
  });

  describe('fail validationi by updating empty chart with a variable', function() {
    it('should return without error', function(done) {
      ChartSchema.findOne({ name: testChart.name })
        .then(model => {
          let newVar = new ChartVariableSchema(testChartVariableBad);
          model.variables = model.variables.concat(newVar); //$pushall problem...
          assert.isRejected(model.save(), "chart validation failed: variables.0.formula: Formula is invalid!");
          done();
        }).catch(err => done(err));
    });
  });

  //todo: fill out patter -- this is largely experimental with mongo -- looking for a good update patter
  // we've already updated and empty variables[] with good and bad variables, still need to: 
    //push in a new one (that's good)
    //update an existing one (solo)
      //for all this, can we just save the whole model and see if it works -- i.e., get back chart from FE, then .save()?
      //what's the drawback -- it will throw validation errors if there's a problem... well, if there's no id would need to
      // new it up (possibly in a loop) for each new variable, but oh well
    //update and existing one (of two)
    //update chart spec and an existing variable
    //remove an existing variable

  // describe('verify that I cannot search for a variable by id because that\'s not how mongo works', function() {
  //   it('should return without error', function(done) {
  //     ChartSchema.findOne({ name: testChart.name })
  //       .then(res => {
  //         let variable = res.variables[0];
  //         ChartVariableSchema.findOne({ _id: variable._id })
  //           .then(res => {
  //             assert.equal(res, null);
  //             done();
  //           })
  //           .catch(err => done(err));
  //       });
  //   });
  // });

  // describe('#rawUpdate', function() {
  //   it('should update correctly using a r aw u pdate m ethod, despite validation and required fields issue', function(done) {
  //     ChartSchema.findOne({ name: testChart.name }).exec()
  //       .then(res => ChartSchema.update({ _id: res._id }, badTestChart))
  //       .then(() => ChartSchema.findOne({ name: badTestChart.name }))
  //       .then(chart => {
  //         assert.equal(chart.variables.length, 1);
  //         done();
  //       })
  //       .catch(err => done(err));
  //   });
  // });

  // //yeah this is all wrong...

  // describe('#badUpdate', function() {
  //   it('should update incorrectly using static update method because that actually catches validation errors', function(done) {
  //     ChartSchema.findOne({ name: testChart.name }).exec()
  //       .then(res => {
  //         const badVar = new ChartVariableSchema(badTestChartFormula.variables[0]);
  //         res.variables.push(badVar);
  //         ChartSchema.update({ _id: res._id }, res)
  //           .then(() => {
  //             assert.equal(true, false); //ugly hacks to make sure promise is rejected -- todo: get chai-as-promised working
  //             done(;
  //           })
  //           .catch((err: Error) => {
  //             done(err); //no assertions will fire here but can verify error by passing error to done
  //           });
  //       });
  //   });
  // });

  // describe('#badUpdateRequired', function() {
  //   it('should update incorrectly using static update method because that actually catches required field errors', function(done) {
  //     ChartSchema.findOne({ name: testChart.name }).exec()
  //       .then(res => {
  //         res.variables.push(badTestChartRequired.variables[0]);
  //         ChartSchema.schema.statics.update(res)
  //           .then(() => {
  //             assert.equal(true, false);
  //             done(;
  //           })
  //           .catch((err: Error) => {
  //             done();
  //           });
  //       });
  //   });
  // });

  // describe('#update()', function() {
  //   it('should update source array with a new source object and a new source value', function(done) {
  //     ChartSchema.findOne({ name: testChart.name }).exec()
  //       .then(res => {
  //         res.variables[0].notes = "new fancy updated notes!";
  //         res.variables.push(newVar);
  //         return ChartSchema.schema.statics.update(res);
  //       }).then(chart => {
  //         assert.equal(chart.variables.length, 2);
  //         expect(chart.variables[0]).to.include({ "notes": "new fancy updated notes!" });
  //         expect(chart.variables[0]).to.not.include({ "notes": "new fancy imagined notes" });
  //         expect(chart.variables[1]).to.include({ "notes": "new test notes" });
  //         done();
  //       })
  //       .catch(err => done(err));
  //   });
  // });

  after('remove test org and variables', function(done) {
    VariableDefinitionSchema.find({ variable: { "$in": ["test_var_1", "test_var_2"] } }).remove().exec()
      .then(() => SchoolSchema.find({ unitid: nwData.unitid }).remove().exec())
      .then(() => done()).catch(err => done(err));
  })

});