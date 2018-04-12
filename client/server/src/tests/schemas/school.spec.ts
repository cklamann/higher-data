import { UserSchema } from '../../schemas/UserSchema';
import { SchoolSchema, intSchoolSchema, intVariableQueryConfig, intSchoolVarExport, intSchoolVarAggExport, intVariableAggQueryConfig } from '../../schemas/SchoolSchema';
import { SchoolDataSchema } from '../../schemas/SchoolDataSchema';
import * as assert from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import * as nwData from '../fixtures/fixtures';
import * as q from 'q';

const app = require('../../app');

describe('School Schema', function() {

  //todo: seems like not using this test data so much anymore, might think about removing...

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.nwData)
      .then(() => SchoolDataSchema.create(nwData.nwData_school_data))
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.nwDataSector40)
      .then(() => SchoolDataSchema.create(nwData.nwDataSector40_school_data))
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.nwDataSector40_all_zeroes)
      .then(() => SchoolDataSchema.create(nwData.nwDataSector40_all_zeroes_school_data))
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.nwDataSector40_all_ones)
      .then(() => SchoolDataSchema.create(nwData.nwDataSector40_all_ones_school_data))
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.zzSchool1)
      .then(() => SchoolDataSchema.create(nwData.zzSchool1_school_data))
      .then(() => done())
      .catch(err => done(err));
  });

  before('create a test school', function(done) {
    SchoolSchema.create(nwData.zzSchool2)
      .then(() => SchoolDataSchema.create(nwData.zzSchool2_school_data))
      .then(() => done())
      .catch(err => done(err));
  });

  describe('test that test school exists', function(){
    it('should return test school with no virtual property',function(done){
      SchoolSchema.find({unitid:nwData.nwData.unitid})
        .then( res => {
          expect(res).to.be.an('array');
          expect(res).to.have.lengthOf(1);
          expect(res).to.not.have.property('school_data');
          done()
        })
       .catch(err => done(err));
    });
  });

  describe('test that test school\'s school_data exists', function(){
    it('should return the school_data that belongs to the test school',function(done){
      SchoolDataSchema.find({unitid:nwData.nwData.unitid})
        .then( res => {
          expect(res).to.be.an('array');
          expect(res).to.have.lengthOf(nwData.nwData_school_data.length);
          done()
        })
       .catch(err => done(err));
    });
  });

  describe('fetch a school with virtual school_data property', function(){
    it('should return one school with its data',function(done){
      SchoolSchema.findOne({unitid:nwData.nwData.unitid}).populate('school_data').exec()
        .then( res => {
          expect(res.school_data).to.exist;
          expect(res.school_data).to.be.an('array');
          expect(res.school_data).to.have.lengthOf(nwData.nwData_school_data.length);
          done()
        })
       .catch(err => done(err));
    });
  });

  describe('fetch a school with specified variables', function() {
    it('should return school with variables', function(done) {
      let queryFilters: intVariableQueryConfig = {
        matches: [{
          unitid: nwData.nwData.unitid
        }],
        sort: '',
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
          //make sure only one school was returned
          expect(res.data).to.have.lengthOf(1);
          //make sure data was filtered correctly
          expect(res.data[0].school_data.filter((datum: any) => datum.variable === "hispanic_p").length).to.be.greaterThan(0);
          expect(res.data[0].school_data.filter((datum: any) => datum.variable === "asian_p").length).to.be.greaterThan(0);
          expect(res.data[0].school_data.filter((datum: any) => datum.variable === "white_p").length).to.equal(0);
          done()
        })
        .catch((err: Error) => done(err));
    });
  });

  describe('fetch all schools with specified variables', function() {
    it('should return schools with variables with correct pagination and filters', function(done) {
      let queryFilters: intVariableQueryConfig = {
        matches: [{}],
        sort: '-2008',
        pagination: {
          perPage: 50,
          page: 3
        },
        inflationAdjusted: "false",
        variables: ["room_and_board", "in_state_tuition"]
      }
      SchoolSchema.schema.statics.fetchWithVariables(queryFilters)
        .then((res: intSchoolVarExport) => {
          expect(res).to.be.an('object');
          expect(res.data.length).to.equal(50);
          expect(res.query.pagination.total).to.be.greaterThan(2000); //about half have the vars have these properties...
          res.data.forEach(datum => expect(datum.school_data.filter((item: any) => item.variable === "white_p").length).to.equal(0));
          expect(res.data.some(datum => datum.school_data.filter((item: any) => item.variable === "room_and_board").length > 0)).to.equal(true);
          expect(res.data.some(datum => datum.school_data.filter((item: any) => item.variable === "in_state_tuition").length > 0)).to.equal(true);
          res.data.forEach((datum: intSchoolSchema, i: number) => {
            if (i < res.data.length - 1) {
              expect(datum.school_data.find(item => item.fiscal_year == "2008" && item.variable === queryFilters.variables[0]).value)
                .to.be.at.least(res.data[i + 1].school_data.find((item: any) => item.fiscal_year === "2008" && item.variable === queryFilters.variables[0]).value);
            }
          });
          done()
        })
        .catch((err: Error) => done(err));
    });
  });


  describe('fetch aggregate', function() {
    it('should return sums by sector', function(done) {
      let queryFilters: intVariableAggQueryConfig = {
        matches: [{}],
        sort: 'sector',
        pagination: {
          perPage: 25,
          page: 1
        },
        inflationAdjusted: "false",
        groupBy: {
          aggFunc: "sum",
          variable: "sector"
        },
        variables: ["federal_pell_grant_program_amt_disb", "in_state_tuition"]
      }
      SchoolSchema.schema.statics.fetchAggregate(queryFilters)
        .then((res: intSchoolVarAggExport) => {
          expect(res).to.be.an('object');
          expect(res.query).to.be.an('object');
          expect(res.data).to.be.an('array');
          expect(res.data[0].sector).to.be.a('string');
          expect(res.data[0].data).to.be.an('array');
          //test sort
          expect(res.data[0].sector).to.equal('0');
          expect(res.data[1].sector).to.equal('1');
          done();
        })
        .catch((err: Error) => done(err));
    });
  });

  describe('fetch aggregate', function() {
    it('should return correct sums by state for ZZ schools', function(done) {
      let queryFilters: intVariableAggQueryConfig = {
        matches: [{ "state": "ZZ" }],
        groupBy: {
          aggFunc: "sum",
          variable: "state"
        },
        inflationAdjusted: "true",
        sort: 'state',
        pagination: {
          perPage: 50,
          page: 1
        },
        variables: ["in_state_tuition"]
      }
      SchoolSchema.schema.statics.fetchAggregate(queryFilters)
        .then((res: intSchoolVarAggExport) => {
          expect(res.query.pagination.total).to.equal(1);
          expect(res).to.be.an('object');
          expect(res.data.length).to.equal(1); //1 variable, 1 state 
          //2 fiscal years
          expect(res.data[0].data.find(item => item.fiscal_year == "2008").value > 2); //2 without inflation
          expect(res.data[0].data.find(item => item.fiscal_year == "2009").value > 2);
          done();
        })
        .catch((err: Error) => done(err));
    });
  });

  describe('fetch aggregate', function() {
    it('should return correct averages by state', function(done) {
      let queryFilters: intVariableAggQueryConfig = {
        matches: [],
        groupBy: {
          aggFunc: "avg",
          variable: "state"
        },
        inflationAdjusted: "false",
        sort: '-2003',
        pagination: {
          perPage: 10,
          page: 2,
          total: 61
        },
        variables: ["in_state_tuition"]
      }
      SchoolSchema.schema.statics.fetchAggregate(queryFilters)
        .then((res: any) => {
          expect(queryFilters.pagination.total).to.exist;
          expect(res).to.be.an('object');
          expect(res.data.length).to.equal(10);
          res.data.forEach((datum: any, i: number) => {
            if (i < res.data.length - 1) {
              expect(datum.data.find((item: any) => item.fiscal_year == "2003").value).to.be.greaterThan(res.data[i + 1].data.find((item: any) => item.fiscal_year === "2003").value);
            }
          });
          done();
        })
        .catch((err: Error) => done(err));
    });
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.nwData.unitid }).remove().exec()
      .then(() => SchoolDataSchema.find({ unitid: nwData.nwData.unitid }).remove().exec())
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.nwDataSector40.unitid }).remove().exec()
      .then(() => SchoolDataSchema.find({ unitid: nwData.nwDataSector40.unitid }).remove().exec())
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.nwDataSector40_all_ones.unitid }).remove().exec()
      .then(() => SchoolDataSchema.find({ unitid: nwData.nwDataSector40_all_ones.unitid }).remove().exec())
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.nwDataSector40_all_zeroes.unitid }).remove().exec()
      .then(() => SchoolDataSchema.find({ unitid: nwData.nwDataSector40_all_ones.unitid }).remove().exec())
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.zzSchool1.unitid }).remove().exec()
      .then(() => SchoolDataSchema.find({ unitid: nwData.zzSchool1.unitid }).remove().exec())
      .then(() => done())
      .catch(err => done(err));
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.zzSchool2.unitid }).remove().exec()
      .then(() => SchoolDataSchema.find({ unitid: nwData.zzSchool2.unitid }).remove().exec())
      .then(() => done())
      .catch(err => done(err));
  });

});