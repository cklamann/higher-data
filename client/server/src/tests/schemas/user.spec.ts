import { UserSchema } from '../../schemas/UserSchema';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
const app = require('../../app');

describe('User Schema', function() {

  describe('#save()', function() {
    it('should save without error', function(done) {
      var user = new UserSchema({ username: "test", password: "test", isAdmin: false });
      user.save()
        .then(user => {
          assert.equal(user.username, "test");
          done();
        })
        .catch(err => done(err));
    });
  });

  after('remove test user', function(done) {
    UserSchema.find({ username: "test" }).remove().exec().then(() => done());
  })
});