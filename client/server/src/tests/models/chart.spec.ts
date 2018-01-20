import { ChartSchema, ChartVariableSchema, intChartModel, intChartVariable } from '../../schemas/ChartSchema';
import assert = require('assert');
import chai = require('chai');
import * as chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
import * as _ from 'lodash';
const app = require('../../app');

chai.should();
chai.use(chaiAsPromised);

describe('Chart Model', function() {

  const testChart: intChartModel = {
    name: 'fake_chart',
    type: 'line',
    slug: 'the-slug',
    category: 'fake',
    active: true,
    valueType: 'currency',
    description: 'sweet chart',
    variables: [{
      formula: '1+2',
      notes: 'test notes',
      legendName: 'test legend'
    }]
  };

  const badTestChart: intChartModel = {
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

  const badTestChartFormula: intChartModel = {
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

  const badTestChartRequired: intChartModel = {
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
    formula: '5+6',
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
          done();
          assert.equal(res.type, 'line');
        });
    });
  });

  describe('#rawUpdate', function() {
    it('should update correctly using a raw update method, despite validation and required fields issue', function(done) {
      ChartSchema.findOne({ name: testChart.name }).exec()
        .then(res => res.update(badTestChart))
        .then(() => ChartSchema.findOne({ name: badTestChart.name }))
        .then(chart => {
          done();
          assert.equal(chart.variables.length, 1);
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
              done();
              assert.equal(true, false); //ugly hacks to make sure promise is rejected -- todo: get chai-as-promised working
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
              done();
              assert.equal(true, false);
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
          done();
          assert.equal(chart.variables.length, 2);
          expect(chart.variables[0]).to.include({ "notes": "new fancy updated notes!" });
          expect(chart.variables[0]).to.not.include({ "notes": "new fancy imagined notes" });
          expect(chart.variables[1]).to.include({ "notes": "new test notes" });
        })
        .catch(err => done(err));
    });
  });

  afterEach('remove test chart', function(done) {
    ChartSchema.find({ name: { "$in": ["fake_chart","bad_chart"] } }).remove().exec().then(() => done()).catch(err => done(err));
  });

});