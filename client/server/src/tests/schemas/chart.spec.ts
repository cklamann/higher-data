import { ChartSchema, ChartVariableSchema, intChartSchema, intChartVariable } from '../../schemas/ChartSchema';
import { nwData, dummyChartData } from '../fixtures/fixtures';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../../schemas/VariableDefinitionSchema';
import { SchoolSchema } from '../../schemas/SchoolSchema';
import assert = require('assert');
import chai = require('chai');
import * as chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
import * as _ from 'lodash';
const app = require('../../app');

chai.should();
chai.use(chaiAsPromised);

describe('Chart Schema', function() {

  const testVar1: intVariableDefinitionSchema = {
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

  const testVar2: intVariableDefinitionSchema = {
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

  const testChart: intChartSchema = {
    name: 'fake_chart',
    type: 'line',
    slug: 'the-slug',
    category: 'fake',
    active: true,
    valueType: 'currency',
    description: 'sweet chart',
    variables: [{
      formula: '1+test_var_1',
      notes: 'test notes',
      legendName: 'test legend'
    }]
  };

  const badTestChart: intChartSchema = {
    name: 'bad_chart',
    type: 'line',
    slug: 'the-slug',
    category: 'fake',
    valueType: 'currency',
    description: 'sweet chart',
    variables: [{
      formula: '1+2 + fake_var',
      notes: 'bad test notes',
      legendName: 'bad test legend'
    }]
  };

  const badTestChartFormula: intChartSchema = {
    name: 'bad_chart',
    type: 'line',
    category: 'fake',
    active: true,
    valueType: 'currency',
    description: 'sweet chart',
    variables: [{
      formula: '1+2 + fake_var',
      notes: 'bad test notes',
      legendName: 'bad test legend'
    }]
  };

  const badTestChartRequired: intChartSchema = {
    name: 'bad_chart',
    type: 'line',
    category: 'fake',
    valueType: 'currency',
    active: true,
    description: 'sweet chart',
    variables: [{
      formula: '1+2',
      legendName: 'test legend'
    }]
  };

  const newVar: intChartVariable = {
    formula: 'test_var_1 + 5',
    notes: 'new test notes',
    legendName: 'new legend name'
  }

  beforeEach('create chart', function(done) {
    ChartSchema.create(testChart)
      .then(() => done())
      .catch(err => done(err));
  });

  describe('test test chart exists', function() {
    it('should return without error', function(done) {
      ChartSchema.findOne({ name: 'fake_chart' })
        .then(res => {
          assert.equal(res.type, 'line');
          done();
        });
    });
  });

  describe('#rawUpdate', function() {
    it('should update correctly using a raw update method, despite validation and required fields issue', function(done) {
      ChartSchema.findOne({ name: testChart.name }).exec()
        .then(res => res.update(badTestChart))
        .then(() => ChartSchema.findOne({ name: badTestChart.name }))
        .then(chart => {
          assert.equal(chart.variables.length, 1);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('#badUpdate', function() {
    it('should update incorrectly using static update method because that actually catches validation errors', function(done) {
      ChartSchema.findOne({ name: testChart.name }).exec()
        .then(res => {
          res.variables.push(badTestChartFormula.variables[0]);
          ChartSchema.schema.statics.update(res)
            .then(() => {
              assert.equal(true, false); //ugly hacks to make sure promise is rejected -- todo: get chai-as-promised working
              done();
            })
            .catch(err => {
              done(); //no assertions will fire here but can verify error by passing error to done
            });
        });
    });
  });

  describe('#badUpdateRequired', function() {
    it('should update incorrectly using static update method because that actually catches required field errors', function(done) {
      ChartSchema.findOne({ name: testChart.name }).exec()
        .then(res => {
          res.variables.push(badTestChartRequired.variables[0]);
          ChartSchema.schema.statics.update(res)
            .then(() => {
              assert.equal(true, false);
              done();
            })
            .catch(err => {
              done();
            });
        });
    });
  });

  describe('#update()', function() {
    it('should update source array with a new source object and a new source value', function(done) {
      ChartSchema.findOne({ name: testChart.name }).exec()
        .then(res => {
          res.variables[0].notes = "new fancy updated notes!";
          res.variables.push(newVar);
          return ChartSchema.schema.statics.update(res);
        }).then(chart => {
          assert.equal(chart.variables.length, 2);
          expect(chart.variables[0]).to.include({ "notes": "new fancy updated notes!" });
          expect(chart.variables[0]).to.not.include({ "notes": "new fancy imagined notes" });
          expect(chart.variables[1]).to.include({ "notes": "new test notes" });
          done();
        })
        .catch(err => done(err));
    });
  });

  afterEach('remove test chart', function(done) {
    ChartSchema.find({ name: { "$in": ["fake_chart","bad_chart"] } }).remove().exec().then(() => done()).catch(err => done(err));
  });

  after('remove test org and variables', function(done) {
    VariableDefinitionSchema.find({ name: { "$in": ["test_var_1", "test_var_2"] } }).remove().exec()
      .then(() => SchoolSchema.find({ unitid: nwData.unitid }).remove().exec())
      .then(() => done()).catch(err => done(err));
  })

});