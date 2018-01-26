import { ChartSchema, ChartVariableSchema, intChartSchema, intChartVariable } from '../../schemas/ChartSchema';
import { Chart, intChartModel, intChartExportData } from '../../models/Chart';
import { intSchoolSchema, SchoolSchema } from '../../schemas/SchoolSchema';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../../schemas/VariableDefinitionSchema';
import { nwData, nwDataSector6, dummyChartData } from '../fixtures/fixtures';
import * as assert from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as _ from 'lodash';
const app = require('../../app');

describe('Chart Model', function() {

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
    },
    {
      formula: 'test_var_1 + test_var_2',
      notes: 'test notes 2',
      legendName: 'test legend 2'
    }]
  };

  //note the limitation here -- every formula must contain at least one variable!

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
      notes: "some test notes would go here"
    }]
  }

  before('seed data and create a test school and variables', function(done) {
    nwData.data = nwData.data.concat(dummyChartData);
    SchoolSchema.create(nwData)
      .then(() => {
        return VariableDefinitionSchema.create([testVar1, testVar2]);
      }).then(() => done()).catch((err) => done(err));
  });

  beforeEach('create chart', function(done) {
    ChartSchema.create(testChart)
      .then(() => done())
      .catch(err => done(err));
  });

  describe('Chart Model', function() {
    it('should return a chart model', function(done) {
      let chart = new Chart(nwData.unitid, testChart.slug);
      chart.export()
        .then(chart => {
          expect(chart).to.be.an('object');
          expect(chart.chart.name).to.equal(testChart.name);
          expect(chart.school.unitid).to.equal(nwData.unitid);
          expect(chart.data).to.be.an('array');
          assert.equal(chart.data.length, testChart.variables.length);
          done();
        }).catch( err => done(err));

    });
  });

  afterEach('remove test chart', function(done) {
    ChartSchema.find({ name: { "$in": ["fake_chart", "bad_chart"] } }).remove().exec().then(() => done()).catch(err => done(err));
  });

  after('remove test org and variables', function(done) {
    VariableDefinitionSchema.find({ name: { "$in": ["test_var_1", "test_var_2"] } }).remove().exec()
      .then(() => SchoolSchema.find({ unitid: nwData.unitid }).remove().exec())
      .then(() => done()).catch(err => done(err));
  })

});