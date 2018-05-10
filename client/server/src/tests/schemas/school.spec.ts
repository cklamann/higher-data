import { UserSchema } from '../../schemas/UserSchema';
import { SchoolSchema, intSchoolSchema } from '../../schemas/SchoolSchema';
import { SchoolDataSchema } from '../../schemas/SchoolDataSchema';
import * as assert from 'assert';
import * as chai from 'chai';
import { expect } from 'chai';
import { nwData, nwData_school_data } from '../fixtures/fixtures';
import * as q from 'q';

const app = require('../../app');

describe('School Schema', function() {

  before('create a test school', function(done) {
    SchoolSchema.create(nwData)
      .then(() => SchoolDataSchema.create(nwData_school_data))
      .then(() => done())
      .catch(err => done(err));
  });

  describe('test that test school exists', function() {
    it('should return test school with no virtual property', function(done) {
      SchoolSchema.find({ unitid: nwData_school_data[0].unitid })
        .then(res => {
          expect(res).to.be.an('array');
          expect(res).to.have.lengthOf(1);
          expect(res).to.not.have.property('school_data');
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('perform a test search', function() {
    it('should return return one dummy school', function(done) {
      SchoolSchema.schema.statics.search(nwData_school_data[0].instnm.slice(0,5))
        .then(res => {
          expect(res).to.be.an('array');
          expect(res).to.have.lengthOf.at.least(1);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('fetch a school with virtual school_data property', function() {
    it('should return one school with its data', function(done) {
      SchoolSchema.findOne({ unitid: nwData_school_data[0].unitid }).populate('school_data').exec()
        .then(res => {
          expect(res.school_data).to.exist;
          expect(res.school_data).to.be.an('array');
          expect(res.school_data).to.have.lengthOf(nwData_school_data.length);
          done();
        })
        .catch(err => done(err));
    });
  });

  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData_school_data[0].unitid }).remove().exec()
      .then(() => SchoolDataSchema.find({ unitid: nwData_school_data[0].unitid }).remove().exec())
      .then(() => done())
      .catch(err => done(err));
  });

});