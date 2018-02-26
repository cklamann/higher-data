import { InflationTableSchema } from '../../schemas/InflationTableSchema';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { expect } from 'chai';
import { nwData, insertDummyChart, removeDummyChart, testChart } from "../fixtures/fixtures";
import { SchoolSchema } from '../../schemas/SchoolSchema';
import { ChartExport } from '../../models/ChartExporter';
chai.use(chaiAsPromised);
const assert = chai.assert;
const app = require('../../app');


describe('Inflation Table Schema', function() {

  before('insertFakeSchool', function(done) {
    SchoolSchema.create(nwData)
      .then(res => {
        insertDummyChart().then(() => done()).catch(err => done(err));
      }).catch(err => done(err));
  })

  describe('#calculate inflation', function() {
    it('should return adjusted numbers', function(done) {
      let exporter = new ChartExport(nwData, testChart, { infationAdjusted: 'true' });
      exporter.export()
        .then(response => {
          console.log(response.data);
          assert.isArray(response.data);
          //minimum fixture val is 50, so inflated should be above 70...
          response.data.forEach(datum => datum.data.forEach(item => assert.isTrue(item.value > 70)));
          done();
        }).catch(err => done(err));
    });
  });

  after('remove test vars', function(done) {
    SchoolSchema.remove({ unitid: nwData.unitid })
      .then(res => {
        removeDummyChart().then(() => done()).catch(err => done(err));
      }).catch(err => done(err));
  })
});