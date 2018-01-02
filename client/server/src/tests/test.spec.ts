import { UserSchema } from '../models/User';
import assert = require('assert');
import chai = require('chai');
import chaiHttp = require('chai-http'); //http://chaijs.com/plugins/chai-http/
//todo: test sessions with chai-passport
import { expect } from 'chai'; 
import chaiAsPromised = require('chai-as-promised');
const app = require('../app');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const connection = chai.request(app);

const username = 'test',
	password = 'test';


//blueprint for schema test
// describe('User', function() {
// 	describe('#save()', function() {
// 		it('should save without error', function(done) {
// 			var user = new UserSchema({ username: "test", password: "fake", isAdmin: false });
// 			user.save(function(err) {
// 				if (err) done(err);
// 				else done();
// 			}).then(function(user) {
// 				assert.equal(user.username, "test");
// 			});
// 		});
// 	});
// });

//blueprints for api route tests

describe("REGISTER", () => {
	it('Post should return status 200', done => {
		connection.post('/api/users')
			.send({ username: username, password: password })
			.end((err, res) => {
				expect(res).to.have.status(200);
				expect(res.body.password).to.be.a('string');
				done();
			});
	});
});

describe("LOGIN", () => {
	it('Post should return status 200', done => {
		connection.post('/api/users/login')
			.send({ username: username, password: password })
			.end((err, res: any) => {
				expect(res.statusCode).to.equal(200);
				expect(res.body.password).to.be.a('string');
				done();
			});
	});
});

describe("DELETE", () => {
	it('Post should return status 200', done => {
		connection.del('/api/users')
			.send({ username: username })
			.end((err, res: any) => {
				expect(res.statusCode).to.equal(200);
				done();
			});
	})
});