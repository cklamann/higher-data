import { UserSchema } from '../../schemas/UserSchema';
import { SchoolSchema, intSchoolSchema, intVariableQueryConfig, intSchoolVarExport, intSchoolVarAggExport, intVariableAggQueryConfig } from '../../schemas/SchoolSchema';
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

  // describe('fetch all schools with specified variables', function() {
  //   it('should return schools with variables', function(done) {
  //     let queryFilters: intVariableQueryConfig = {
  //       matches: [{}],
  //       sort: 'unitid',
  //       pagination: {
  //         perPage: 500,
  //         page: 1
  //       },
  //       inflationAdjusted: "false",
  //       variables: ["hispanic_p", "asian_p"]
  //     }
  //     SchoolSchema.schema.statics.fetchWithVariables(queryFilters)
  //       .then((res: intSchoolVarExport) => {
  //         //todo -- this test is bunk, need to find the specified school, not count on order, cuz it's bringing back a lot now...
  //         expect(res).to.be.an('object');
  //         expect(res.query.pagination.total).to.be.greaterThan(7000);
  //         expect(res.data[0].data.filter((datum: any) => datum.variable === "hispanic_p").length).to.be.greaterThan(0);
  //         expect(res.data[0].data.filter((datum: any) => datum.variable === "asian_p").length).to.be.greaterThan(0);
  //         expect(res.data[0].data.filter((datum: any) => datum.variable === "white_p").length).to.equal(0);
  //         done()
  //       })
  //       .catch((err: Error) => done(err));
  //   });
  // });

  describe('fetch a school with specified variables', function() {
    it('should return school with variables', function(done) {
      let queryFilters: intVariableQueryConfig = {
        matches: [{
          unitid: nwData.nwData.unitid
        }],
        sort: '2008',
        pagination: {
          perPage: 25,
          page: 1
        },
        inflationAdjusted: "false",
        variables: ["hispanic_p", "asian_p"]
      }
      SchoolSchema.schema.statics.fetchWithVariables(queryFilters)
        // .then((res: intSchoolVarExport) => {
          .then((res: any) => {
          console.log(res.data[0].idx);
          console.log(res.data[0].red);
          expect(res).to.be.an('object');
          expect(res.data[0].data.filter((datum: any) => datum.variable === "hispanic_p").length).to.be.greaterThan(0);
          expect(res.data[0].data.filter((datum: any) => datum.variable === "asian_p").length).to.be.greaterThan(0);
          expect(res.data[0].data.filter((datum: any) => datum.variable === "white_p").length).to.equal(0);
          done()
        })
        .catch((err: Error) => done(err));
    });
  });

  // describe('fetch aggregate', function() {
  //   it('should return sums by sector', function(done) {
  //     let queryFilters: intVariableAggQueryConfig = {
  //       matches: [{}],
  //       sort: 'sector',
  //       pagination: {
  //         perPage: 25,
  //         page: 1
  //       },
  //       inflationAdjusted: "false",
  //       groupBy: {
  //         aggFunc: "sum",
  //         variable: "sector"
  //       },
  //       variables: ["federal_pell_grant_program_amt_disb", "in_state_tuition"]
  //     }
  //     SchoolSchema.schema.statics.fetchAggregate(queryFilters)
  //       .then((res: intSchoolVarAggExport) => {
  //         expect(res).to.be.an('object');
  //         expect(res.query).to.be.an('object');
  //         expect(res.data).to.be.an('array');
  //         expect(res.data[0].sector).to.be.a('string');
  //         expect(res.data[0].data).to.be.an('array');
  //         //test sort
  //         expect(res.data[0].sector).to.equal('0');
  //         expect(res.data[1].sector).to.equal('1');
  //         // expect(res.data.find(obj => (obj.fiscal_year === '2008' && obj.sector === '40') && obj.variable === 'asian_p').value).to.equal(100);
  //         done();
  //       })
  //       .catch((err: Error) => done(err));
  //   });
  // });

  // describe('fetch aggregate', function() {
  //   it('should return correct sums by state for ZZ schools', function(done) {
  //     let queryFilters: intVariableAggQueryConfig = {
  //       matches: [{ "state": "ZZ" }],
  //       groupBy: {
  //         aggFunc: "sum",
  //         variable: "state"
  //       },
  //       inflationAdjusted: "true",
  //       sort: 'state',
  //       pagination: {
  //         perPage: 50,
  //         page: 1
  //       },
  //       variables: ["in_state_tuition"]
  //     }
  //     SchoolSchema.schema.statics.fetchAggregate(queryFilters)
  //       .then((res: intSchoolVarAggExport) => {
  //         expect(res.query.pagination.total).to.equal(1);
  //         expect(res).to.be.an('object');
  //         expect(res.data.length).to.equal(1); //1 variable, 1 state 
  //         //2 fiscal years
  //         expect(res.data[0].data.find(item => item.fiscal_year == "2008").value > 2); //2 without inflation
  //         expect(res.data[0].data.find(item => item.fiscal_year == "2009").value > 2);
  //         done();
  //       })
  //       .catch((err: Error) => done(err));
  //   });
  // });

  // describe('fetch aggregate', function() {
  //   it('should return correct averages by state', function(done) {
  //     let queryFilters: intVariableAggQueryConfig = {
  //       matches: [],
  //       groupBy: {
  //         aggFunc: "avg",
  //         variable: "state"
  //       },
  //       inflationAdjusted: "false",
  //       sort: '-2003',
  //       pagination: {
  //         perPage: 10,
  //         page: 2,
  //         total: 61
  //       },
  //       variables: ["in_state_tuition"]
  //     }
  //     SchoolSchema.schema.statics.fetchAggregate(queryFilters)
  //       .then((res: any) => {
  //         expect(queryFilters.pagination.total).to.exist;
  //         expect(res).to.be.an('object');
  //         expect(res.data.length).to.equal(10);
  //         res.data.forEach((datum: any, i: number) => {
  //           if (i < res.data.length - 1) {
  //             expect(datum.data.find((item: any) => item.fiscal_year == "2003").value).to.be.greaterThan(res.data[i + 1].data.find((item: any) => item.fiscal_year === "2003").value);
  //           }
  //         });
  //         done();
  //       })
  //       .catch((err: Error) => done(err));
  //   });
  // });

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