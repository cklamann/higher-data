import { UserSchema } from '../../schemas/UserSchema';
import { SchoolSchema, intSchoolSchema, intVariableQueryConfig, intSchoolVarExport, intVariableAggQueryConfig } from '../../schemas/SchoolSchema';
import * as assert from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as nwData from '../fixtures/fixtures';
import * as q from 'q';

const app = require('../../app');

describe('School Schema', function() {

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.nwData)
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.nwDataSector40)
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.nwDataSector40_all_zeroes)
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.nwDataSector40_all_ones)
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.zzSchool1)
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.zzSchool2)
      .then(() => done())
      .catch(err => done(err));
  });

  describe('fetch a school with specified variables', function() {
    it('should return school with variables', function(done) {
      let queryFilters: intVariableQueryConfig = {
        matches: [{
          unitid: nwData.nwData.unitid
        }],
        sort: '-fiscal_year',
        pagination: {
          perPage: 25,
          page: 1
        },
        inflationAdjusted: "false",
        variables: ["hispanic_p", "asian_p"]
      }
      SchoolSchema.schema.statics.fetchWithVariables(queryFilters)
        .then((res: intSchoolVarExport) => {
          expect(res).to.be.an('object');
          expect(res.data.filter((datum: any) => datum.variable === "hispanic_p").length).to.be.greaterThan(0);
          expect(res.data.filter((datum: any) => datum.variable === "asian_p").length).to.be.greaterThan(0);
          expect(res.data.filter((datum: any) => datum.variable === "white_p").length).to.equal(0);
          done()
        })
        .catch((err: Error) => done(err));
    });
  });

  describe('fetch aggregate', function() {
    it('should return sums by sector', function(done) {
      let queryFilters: intVariableAggQueryConfig = {
        matches: [{}],
        sort: '-fiscal_year',
        pagination: {
          perPage: 25,
          page: 1
        },
        inflationAdjusted: "false",
        groupBy: {
          aggFunc: "sum",
          aggFuncName: "sector_total",
          variable: "sector"
        },
        variables: ["hispanic_p", "asian_p"]
      }
      SchoolSchema.schema.statics.fetchAggregate(queryFilters)
        .then((res: intSchoolVarExport) => {
          expect(res).to.be.an('object');
          //test pagination
          expect(res.data.length === 25);
          //test sort
          expect(res.data[0].fiscal_year).to.equal('2008');
          //test a value...
          expect(res.data.find(obj => (obj.fiscal_year === '2008' && obj.sector === '40') && obj.variable === 'asian_p').value).to.equal(100);
          done();
        })
        .catch((err: Error) => done(err));
    });
  });

  describe('fetch aggregate', function() {
    it('should return sums by state for ZZ schools', function(done) {
      let queryFilters: intVariableAggQueryConfig = {
        matches: [{ "state": "ZZ" }], groupBy: {
          aggFunc: "sum",
          aggFuncName: "state_total",
          variable: "state"
        },
        inflationAdjusted: "false",
        sort: 'fiscal_year',
        pagination: {
          perPage: 50,
          page: 1
        },
        variables: ["in_state_tuition"]
      }
      SchoolSchema.schema.statics.fetchAggregate(queryFilters)
        .then((res: intSchoolVarExport) => {
          expect(res.query).to.equal(queryFilters);
          expect(res).to.be.an('object');
          expect(res.data[0].fiscal_year).to.equal('2009');
          expect(res.data.length == 2); //1 variable, 2 fiscal years 
          expect(res.data.find(item => item.fiscal_year == "2008").value == 2);
          expect(res.data.find(item => item.fiscal_year == "2009").value == 2);
          done();
        })
        .catch((err: Error) => done(err));
    });
  });

  describe('fetch aggregate', function() {
    it('should return averages by state for ZZ schools', function(done) {
      let queryFilters: intVariableAggQueryConfig = {
        matches: [{ "state": "ZZ" }],
        groupBy: {
          aggFunc: "avg",
          aggFuncName: "state_total",
          variable: "state"
        },
        inflationAdjusted: "false",
        sort: 'fiscal_year',
        pagination: {
          perPage: 50,
          page: 1
        },
        variables: ["in_state_tuition"]
      }
      SchoolSchema.schema.statics.fetchAggregate(queryFilters)
        .then((res: intSchoolVarExport) => {
          expect(res.query).to.equal(queryFilters);
          expect(res).to.be.an('object');
          expect(res.data[0].fiscal_year).to.equal('2009');
          expect(res.data.length == 2); //1 variable, 2 fiscal years 
          expect(res.data.find(item => item.fiscal_year == "2008").value == .5);
          expect(res.data.find(item => item.fiscal_year == "2009").value == .5);
          done();
        })
        .catch((err: Error) => done(err));
    });
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.nwData.unitid }).remove().exec()
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.nwDataSector40.unitid }).remove().exec()
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.nwDataSector40_all_ones.unitid }).remove().exec()
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.nwDataSector40_all_zeroes.unitid }).remove().exec()
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.zzSchool1.unitid }).remove().exec()
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.zzSchool2.unitid }).remove().exec()
      .then(() => done())
      .catch(err => done(err));
  });

});