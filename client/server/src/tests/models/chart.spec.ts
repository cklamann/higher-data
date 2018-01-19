import { ChartSchema, ChartVariableSchema, intChartModel, intChartVariable } from '../../models/Chart';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
import * as _ from 'lodash';
const app = require('../../app');

describe('Chart Model', function() {

  const testChart: intChartModel = {
    name: 'fake_chart',
    type: 'line',
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

  before('create chart', function(done) {
    ChartSchema.create(testChart)
      .then( () => done())
      .catch(err => done(err));
  });

  describe('test test chart exists', function() {
    it('should return without error', function(done) {
      ChartSchema.findOne({ name: 'fake_chart' })
        .then(res => {
          done();
          assert.equal(res.type, 'line');
          //expect(res).to.deep.include({ variable: 'test_var' })
        });
    });
  });

  //todo: get update tests working

  // describe('#update()', function() {
  //   it('should update source array with a new source object and a new source value', function(done) {
  //     let newSource:intVariableSource = {
  //         start_year: 2019,
  //         end_year: 2020,
  //         source: "IPEDS",
  //         table: "test_ipeds_table",
  //         formula: "2+2=4",
  //         definition: "some other test definition",
  //         notes: "some other notes!"
  //       };

  //     VariableDefinitionSchema.findOne({variable:testVar.variable}).exec()
  //       .then(res => {
  //         res.sources[0].source = "new fancy updated source!";
  //         res.sources.push(newSource);
  //         return VariableDefinitionSchema.schema.statics.update(res);
  //       }).then(variable => {
  //         done();
  //         assert.equal(variable.sources.length, 2);
  //         expect(variable.sources[0]).to.include({"source" : "new fancy updated source!"});
  //         expect(variable.sources[0]).to.not.include({"source" : "new fancy imagined source!"});
  //         expect(variable.sources[1]).to.include({"notes" : "some other notes!"});
  //       })
  //       .catch(err => done(err));
  //   });
  // });

  after('remove test chart', function(done) {
    ChartSchema.find({ name: "fake_chart" }).remove().exec().then(() => done()).catch(err=>done(err));
  });

});