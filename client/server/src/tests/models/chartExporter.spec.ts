import { ChartSchema, ChartVariableSchema, intChartSchema, intChartModel, intChartVariableModel } from '../../schemas/ChartSchema';
import { ChartExport, intChartExport } from '../../models/ChartExporter';
import { intSchoolSchema, SchoolSchema } from '../../schemas/SchoolSchema';
import { VariableDefinitionSchema, intVariableDefinitionSchema, intVariableDefinitionModel } from '../../schemas/VariableDefinitionSchema';
import { nwData, nwData_school_data, nwDataSector6, nwDataSector6_school_data, dummyChartData, dummyChartData2 } from '../fixtures/fixtures';
import { SchoolDataSchema } from '../../schemas/SchoolDataSchema';
import * as assert from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as _ from 'lodash';
const app = require('../../app');

describe('ChartExporter', function() {

  const testChartValidNoMath: intChartModel = {
    name: 'fake_chart',
    type: 'line',
    slug: 'no-math-slug',
    category: 'fake',
    active: true,
    valueType: 'currency',
    description: 'sweet chart',
    cuts: [],
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
    cuts: [{ name: "fte_ug", formula: "fte_ug" }],
    variables: [{
      formula: 'test_var_1 + test_var_2',
      notes: 'test notes',
      legendName: 'test legend'
    }]
  };

  const testVar1: intVariableDefinitionModel = {
    variable: "test_var_1",
    valueType: "currency0",
    friendlyName: '',
    category: '',
    sources: [{
      startYear: "2015",
      endYear: "2017",
      source: "IPEDS",
      table: "test_ipeds_table",
      formula: "source formula doesn't matter",
      definition: "test definition",
      notes: "some test notes"
    }]
  }

  const testVar2: intVariableDefinitionModel = {
    variable: "test_var_2",
    valueType: "currency0",
    friendlyName: '',
    category: '', sources: [{
      startYear: "2015",
      endYear: "2017",
      source: "IPEDS",
      table: "test_ipeds_table",
      formula: "source formula doesn't matter",
      definition: "test definition",
      notes: "some test notes would go here"
    }]
  }

  const testVar3: intVariableDefinitionModel = {
    variable: "test_var_3",
    valueType: "currency0",
    friendlyName: '',
    category: '', sources: [{
      startYear: "2015",
      endYear: "2017",
      source: "IPEDS",
      table: "test_ipeds_table",
      formula: "source formula doesn't matter",
      definition: "test definition",
      notes: "some test notes would go here"
    }]
  }

  const testVar4: intVariableDefinitionModel = {
    variable: "test_var_4",
    valueType: "currency0",
    friendlyName: '',
    category: '', sources: [{
      startYear: "2015",
      endYear: "2017",
      source: "IPEDS",
      table: "test_ipeds_table",
      formula: "source formula doesn't matter",
      definition: "test definition",
      notes: "some test notes would go here"
    }]
  }

  //give newData test_var_1 and test_var_2
  before('seed first and create variables', function(done) {
    SchoolDataSchema.create(nwData_school_data)
      .then( () => SchoolSchema.create(nwData))  
      .then( () => done()).catch((err) => done(err));
  });

  //give sector6 test_var_3 and test_var_4
  before('seed sector 6', function(done) {
    let dummyChartData22 = dummyChartData2.slice().map(x => {
      x.unitid = nwDataSector6.unitid;
      return x;
    });
    SchoolDataSchema.create(nwDataSector6_school_data)
      .then( () => SchoolSchema.create(nwDataSector6))  
      .then( () => done()).catch((err) => done(err));

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
      let chart = new ChartExport(nwData, testChartValidNoMath, { cut: '' });
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
      let chart = new ChartExport(nwData, testChartValidAddition, { cut: '' });
      chart.export()
        .then(chart => {
          expect(chart).to.be.an('object');
          expect(chart.chart.name).to.equal(testChartValidAddition.name);
          expect(chart.school.unitid).to.equal(nwData.unitid);
          expect(chart.data).to.be.an('array');
          assert.equal(chart.data.length, testChartValidAddition.variables.length);
          chart.data.forEach(group => assert(group.data.length > 0));
          chart.data.forEach(group => group.data.forEach(datum => assert(parseFloat(datum.value) > 99)));
          done();
        }).catch(err => done(err));

    });
  });

  describe('cut a chart by fte_ug', function() {
    it('should return a chart export with cut values', function(done) {
      let chart = new ChartExport(nwData, testChartValidAddition, { cut: 'fte_ug' });
      chart.export()
        .then(chart => {
          expect(chart).to.be.an('object');
          expect(chart.chart.name).to.equal(testChartValidAddition.name);
          expect(chart.school.unitid).to.equal(nwData.unitid);
          expect(chart.data).to.be.an('array');
          assert.equal(chart.data.length, testChartValidAddition.variables.length);
          chart.data.forEach(group => assert(group.data.length > 0));
          //value should be less than 1 for each b/c we're dividing 3 digit # by 4-digit #
          chart.data.forEach(group => group.data.forEach(datum => assert(datum.value < 1)));
          done();
        }).catch(err => done(err));

    });
  });

  describe('#calculate inflation', function() {
    it('should return adjusted numbers', function(done) {
      let exporter = new ChartExport(nwData, testChartValidNoMath, { inflationAdjusted: 'true' });
      exporter.export()
        .then(response => {
          expect(response.data).to.be.an('array');
          //minimum fixture val is 50, so inflated should be above 70...
          response.data.forEach(datum => datum.data.forEach(item => console.log(item)));
          response.data.forEach(datum => datum.data.forEach(item => expect(item.value).to.be.greaterThan(70)));
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
      .then(() => SchoolDataSchema.find({ unitid: { "$in": [nwData.unitid, nwDataSector6.unitid] } }).remove().exec())
      .then(() => done()).catch(err => done(err));
  })

});