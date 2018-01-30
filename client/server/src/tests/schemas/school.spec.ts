import { UserSchema } from '../../schemas/UserSchema';
import { SchoolSchema, intSchoolSchema } from '../../schemas/SchoolSchema';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
import {nwData, nwDataSector6} from '../fixtures/fixtures';
import * as q from 'q';

const app = require('../../app');

describe('School Schema', function() {

  before('create a test school', function(done) {
  SchoolSchema.create(nwData)
    .then( () => done())
    .catch( err => done(err));
   });

  describe('#fetch a variable()', function() {
    it('should return specified variable for all schools', function(done) {
      SchoolSchema.schema.statics.fetchVariable('black_p', 10)
        .then(function(res:any) {
          expect(res).to.be.an('array');
          expect(res[0].data.filter((datum:any) => datum.variable === "black_p").length).to.be.greaterThan(0);
          expect(res[0].data.filter( (datum:any) => datum.variable === "white_p").length).to.equal(0);
          done();
        })
        .catch( (err:Error) => done(err));
    });
  });

  describe('#fetch a variable for certain schools based on a filter()', function() {
    it('should return specified variable based on filters', function(done) {
      let filters = [{ name: "sector", value: "5" }];
      //todo: actually test the filter, not just the fetch......
      SchoolSchema.schema.statics.fetchVariable('black_p',10)
        .then( (res:any) => {
          expect(res).to.be.an('array');
          expect(res[0].data.filter( (datum:any) => datum.variable === "black_p").length).to.be.greaterThan(0);
          done();
        })
        .catch( (err:Error) => done(err));
    });
  });

  describe('fetch a school with specified variables', function() {
    it('should return school with variables', function(done) {
      let variables = ["hispanic_p", "asian_p"];
      SchoolSchema.schema.statics.fetchSchoolWithVariables(nwData.unitid, variables)
        .then( (res:any) => {
          expect(res).to.be.an('object');
          expect(res.unitid).to.equal(nwData.unitid);
          expect(res.data).to.be.an('array');
          expect(res.data.filter( (datum:any) => datum.variable === "hispanic_p").length).to.be.greaterThan(0);
          expect(res.data.filter((datum: any) => datum.variable === "asian_p").length).to.be.greaterThan(0);
          expect(res.data.filter((datum: any) => datum.variable === "white_p").length).to.equal(0);
          done()
        })
        .catch((err:Error) => done(err));
    });
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({unitid:nwData.unitid}).remove().exec()
      .then(() => done())
      .catch(err => done(err));
  });

});