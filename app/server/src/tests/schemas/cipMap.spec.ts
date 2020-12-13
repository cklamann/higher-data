import { CipMapSchema } from '../../schemas/CipMapSchema';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
const app = require('../../app');

describe('CipMap Schema', function() {

  describe('#fetch()', function() {
    it('should fetch the cipmap', function(done) {
      CipMapSchema.find()
        .then(cipmap => {
          expect(cipmap).to.be.an('array');
          expect(cipmap[0]).to.have.property('label');
          expect(cipmap[0]).to.have.property('cipcode');
          done();
        })
        .catch(err => done(err));
    });
  });

});