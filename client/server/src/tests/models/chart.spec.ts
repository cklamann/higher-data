import { ChartSchema, ChartVariableSchema, intChartSchema, intChartModel, intChartVariableModel } from '../../schemas/ChartSchema';
import { Chart, intChartExport } from '../../models/ChartExporter';
import { intSchoolSchema, SchoolSchema } from '../../schemas/SchoolSchema';
import { VariableDefinitionSchema, intVariableDefinitionSchema, intVariableDefinitionModel } from '../../schemas/VariableDefinitionSchema';
import { nwData, nwDataSector6, dummyChartData, dummyChartData2 } from '../fixtures/fixtures';
import * as assert from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as _ from 'lodash';
const app = require('../../app');

describe('Chart Model', function() {

  const testChartValidNoMath: intChartModel = {
    name: 'fake_chart',
    type: 'line',
    slug: 'no-math-slug',
    category: 'fake',
    active: true,
    valueType: 'currency',
    description: 'sweet chart',
    variables: [{
      formula: 'test_var_1',
      notes: 'test notes',
      legendName: 'test legend'
    }]
  };

  const testChartValidAddition: intChartModel = {
    name: 'valid_addition_chart',
    type: 'line',
    slug: 'valid-addition-slug',
    category: 'fake',
    active: true,
    valueType: 'currency',
    description: 'sweet chart',
    variables: [{
      formula: 'test_var_1 + test_var_2',
      notes: 'test notes',
      legendName: 'test legend'
    }]
  };

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
      notes: "some test notes would go here"
    }]
  }

  const testVar3: intVariableDefinitionModel = {
    variable: "test_var_3",
    type: "currency",
    sources: [{
      start_year: 2015,
      end_year: 2017,
      source: "IPEDS",
      table: "test_ipeds_table",
      formula: "source formula doesn't matter",
      definition: "test definition",
      notes: "some test notes would go here"
    }]
  }

  const testVar4: intVariableDefinitionModel = {
    variable: "test_var_4",
    type: "currency",
    sources: [{
      start_year: 2015,
      end_year: 2017,
      source: "IPEDS",
      table: "test_ipeds_table",
      formula: "source formula doesn't matter",
      definition: "test definition",
      notes: "some test notes would go here"
    }]
  }

  //give newData test_var_1 and test_var_2
  before('seed first and create variables', function(done) {
    nwData.data = nwData.data.concat(dummyChartData);
    SchoolSchema.create(nwData)
      .then(() => done()).catch((err) => done(err));
  });

  //give sector6 test_var_3 and test_var_4
  before('seed sector 6', function(done) {
    nwDataSector6.data = nwDataSector6.data.concat(dummyChartData2);
    SchoolSchema.create(nwDataSector6)
      .then(() => done()).catch((err) => done(err));
  });

  //save variables
  before('seed variables', function(done) {
    VariableDefinitionSchema.create([testVar1, testVar2])
      .then(() => done()).catch((err) => done(err));
  });

  before('seed other variables', function(done) {
    VariableDefinitionSchema.create([testVar3, testVar4])
      .then(() => done()).catch((err) => done(err));
  });


  beforeEach('create chart', function(done) {
    ChartSchema.create(testChartValidNoMath)
      .then(() => done())
      .catch(err => done(err));
  });


  beforeEach('create valid addition chart', function(done) {
    ChartSchema.create(testChartValidAddition)
      .then(() => done())
      .catch(err => done(err));
  });

  describe('Return chart with one variable that does no arithmetic', function() {
    it('should return a chart model with data in its data array', function(done) {
      let chart = new Chart(nwData.unitid, testChartValidNoMath.slug);
      chart.export()
        .then(chart => {
          expect(chart).to.be.an('object');
          expect(chart.chart.name).to.equal(testChartValidNoMath.name);
          expect(chart.school.unitid).to.equal(nwData.unitid);
          expect(chart.data).to.be.an('array');
          assert.equal(chart.data.length, testChartValidNoMath.variables.length);
          chart.data.forEach(group => assert(group.data.length > 0));
          done();
        }).catch(err => done(err));

    });
  });

  describe('Return chart with data with valid simple addition formula', function() {
    it('should return a chart model with a single array of data that is the result of two summed variables', function(done) {
      let chart = new Chart(nwData.unitid, testChartValidAddition.slug);
      chart.export()
        .then(chart => {
          expect(chart).to.be.an('object');
          expect(chart.chart.name).to.equal(testChartValidAddition.name);
          expect(chart.school.unitid).to.equal(nwData.unitid);
          expect(chart.data).to.be.an('array');
          assert.equal(chart.data.length, testChartValidAddition.variables.length);
          chart.data.forEach(group => assert(group.data.length>0));
          chart.data.forEach(group => group.data.forEach(datum => assert(parseFloat(datum.value)>99)));
          done();
        }).catch(err => done(err));

    });
  });

  afterEach('remove test chart', function(done) {
    ChartSchema.find({ name: { "$in": ["fake_chart", "bad_chart", "valid_addition_chart", "fake_chart_with_optional_var"] } }).remove().exec().then(() => done()).catch(err => done(err));
  });

  after('remove test org and variables', function(done) {
    VariableDefinitionSchema.find({ variable: { "$in": ["test_var_1", "test_var_2", "test_var_3", "test_var_4"] } }).remove().exec()
      .then(() => SchoolSchema.find({ unitid: { "$in": [nwData.unitid, nwDataSector6.unitid] } }).remove().exec())
      .then(() => done()).catch(err => done(err));
  })

});