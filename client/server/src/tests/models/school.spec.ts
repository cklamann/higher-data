import { UserSchema } from '../../models/User';
import { SchoolSchema } from '../../models/School';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
const app = require('../../app');

describe('School Model', function() {

  describe('#fetch a variable()', function() {
    it('should return specified variable for all schools', function(done) {
      SchoolSchema.schema.statics.fetchVariable('black_p', 10)
        .then(function(res) {
          done();
          expect(res).to.be.an('array');
          expect(res[0].data.filter(datum => datum.variable === "black_p").length).to.be.greaterThan(0);
          expect(res[0].data.filter(datum => datum.variable === "white_p").length).to.equal(0);
        })
        .catch(err => done(err));
    });
  });

  describe('#fetch a variable for certain schools based on a filter()', function() {
    it('should return specified variable based on filters', function(done) {
      let filters = [{ name: "sector", value: "5" }];
      SchoolSchema.schema.statics.fetchVariable('black_p')
        .then(res => {
          done();
          expect(res).to.be.an('array');
          expect(res[0].data.filter(datum => datum.variable === "black_p").length).to.be.greaterThan(0);
        })
        .catch(err => done(err));
    });
  });

  describe('fetch a school with specified variables', function() {
    it('should return school with variables', function(done) {
      let variables = ["hispanic_p", "asian_p"];
      SchoolSchema.schema.statics.fetchSchoolWithVariables(147767, variables)
        .then(res => {
          done()
          expect(res).to.be.an('object');
          expect(res.unitid).to.equal(147767);
          expect(res.data).to.be.an('array');
          expect(res.data.filter(datum => datum.variable === "hispanic_p").length).to.be.greaterThan(0);
          expect(res.data.filter(datum => datum.variable === "asian_p").length).to.be.greaterThan(0);
          expect(res.data.filter(datum => datum.variable === "white_p").length).to.equal(0);
        })
        .catch((err) => done(err));
    });
  });
});