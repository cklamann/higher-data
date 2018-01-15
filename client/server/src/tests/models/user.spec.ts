import { UserSchema } from '../../models/User';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
const app = require('../../app');

describe('User Model', function() {

  describe('#save()', function() {
    it('should save without error', function(done) {
      var user = new UserSchema({ username: "test", password: "test", isAdmin: false });
      user.save(function(err) {
        if (err) done(err);
        else done();
      }).then(function(user) {
        assert.equal(user.username, "test");
      });
    });
  });

  after('remove test user', function(done) {
    UserSchema.find({ username: "test" }).remove().exec();
    done();
  })
});