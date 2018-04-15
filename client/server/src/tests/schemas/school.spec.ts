import { UserSchema } from '../../schemas/UserSchema';
import { SchoolSchema, intSchoolSchema, intSchoolVarExport, intSchoolVarAggExport, intVariableAggQueryConfig } from '../../schemas/SchoolSchema';
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


  after('destroy test school', function(done) {
    SchoolSchema.find({ unitid: nwData.nwData.unitid }).remove().exec()
      .then(() => SchoolDataSchema.find({ unitid: nwData.nwData.unitid }).remove().exec())
      .then(() => done())
      .catch(err => done(err));
  });

});