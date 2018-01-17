import { UserSchema } from '../../models/User';
import { SchoolSchema } from '../../models/School';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
const app = require('../../app');

describe('School Model', function() {

  describe('#fetch a variable()', function() {
    it('should return specified variable for all schools', function(done) {
      SchoolSchema.schema.statics.fetchVariable('black_p', 10, function(err) {
        if (err) done(err);
        else done();
      }).then(function(res) {
        expect(res).to.be.an('array');
        expect(res[0]).to.deep.include({ "data.variable": "black_p" });
        expect(res[0]).to.not.deep.include({ "data.variable": "white_p" });
      });
    });
  });

  describe('#fetch a variable for certain schools based on a filter()', function() {
    it('should return specified variable based on filters', function(done) {
      let filters = [{ name: "sector", value: "5" }];
      SchoolSchema.schema.statics.fetchVariable('black_p', filters, 10, function(err) {
        if (err) done(err);
        else done();
      }).then(function(res) {
        expect(res).to.be.an('array');
        res.forEach(resp => expect(resp).to.deep.include({ "data.variable": "black_p" }));
      });
    });
  });

  describe('fetch a school with specified variables', function() {
    it('should return school with variables', function(done) {
      let variables = ["hispanic_p","asian_p"];
      SchoolSchema.schema.statics.fetchSchoolWithVariables(147767, variables, function(err) {
        if (err) done(err);
        else done();
      }).then(function(res) {
        expect(res).to.be.an('object');
        expect(res.unitid).to.equal('147767');
        expect(res.data).to.be.an('array');
        expect(res).to.deep.include({ "data.variable": "hispanic_p" });
        expect(res).to.deep.include({ "data.variable": "asian_p" });
        expect(res).to.not.deep.include({ "data.variable": "white_p" });
      });
    });
  });

});