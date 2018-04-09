import { MajorSchema  } from '../../schemas/MajorSchema';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
const app = require('../../app');

describe('CipMap Schema', function() {

  describe('#fetch()', function() {
    it('should fetch the schema', function(done) {
      MajorSchema.find().limit(50)
        .then(schema => {
          expect(schema).to.be.an('array');
          expect(schema[0]).to.have.property('fiscal_year');
          expect(schema[0]).to.have.property('awlevel');
          done();
        })
        .catch(err => done(err));
    });
  });

});