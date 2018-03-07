import { UserSchema } from '../../schemas/UserSchema';
import { SchoolSchema, intSchoolSchema, intVariableQueryConfig, intVarAggExport } from '../../schemas/SchoolSchema';
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

  describe('fetch a school with specified variables', function() {
    it('should return school with variables', function(done) {
      let variables = ["hispanic_p", "asian_p"];
      SchoolSchema.schema.statics.fetchSchoolWithVariables(nwData.nwData.unitid, variables)
        .then(res => {
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
      let queryFilters: intVariableQueryConfig = {
        matches: {},
        sort: '-fiscal_year',
        pagination: {
          perPage: 25,
          page: 1
        },
        groupBy: {
          aggFunc: "sum",
          aggFuncName: "sector_total",
          variable: "sector"
        }
      }
      let variables = ["hispanic_p", "asian_p"];
      SchoolSchema.schema.statics.fetchAggregate(variables, queryFilters)
        .then((res: intVarAggExport) => {
          //console.log(res);
          expect(res).to.be.an('object');
          expect(res.data.length === 25);
          expect(res.data[0]._id['fiscal_year']).to.equal('2008');
          expect(res.data.find(obj => (obj._id['fiscal_year'] === '2008' && obj._id['sector'] === '40') && obj._id['variable'] === 'asian_p').value).to.equal(100);
          done();
        })
        .catch((err: Error) => done(err));
    });
  });

  describe('fetch aggregate', function() {
    it('should return sums by sector for missouri schools', function(done) {
      let queryFilters: intVariableQueryConfig = {
        matches: { "state": "MO" }, groupBy: {
          aggFunc: "sum",
          aggFuncName: "sector_total",
          variable: "sector"
        },
        sort: 'fiscal_year',
        pagination: {
          perPage: 50,
          page: 1
        }
      }
      let variables = ["hispanic_p", "asian_p"];
      SchoolSchema.schema.statics.fetchAggregate(variables, queryFilters)
        .then((res: intVarAggExport) => {
          console.log(res);
          expect(res.query).to.equal(queryFilters);
          expect(res).to.be.an('object');
          expect(res.data.length > 30); //~15 years, 2 variables...
          //todo: use school in fake state with only 2 years of data, make sure we only have 4 responses...
          //sum will be known in advance
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

});