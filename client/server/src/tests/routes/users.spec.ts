import { UserSchema } from '../../models/User';
import assert = require('assert');
import chai = require('chai');
import chaiHttp = require('chai-http'); 
import { expect } from 'chai';
import chaiAsPromised = require('chai-as-promised');
const app = require('../../app');


chai.use(chaiHttp);
chai.use(chaiAsPromised);
const connection = chai.request(app);

const username = 'test',
	password = 'test';

describe("userRoute", () => {

	describe("REGISTER", () => {
		it('Post should return status 200', done => {
			connection.post('/api/users')
				.send({ username: username, password: password })
				.end((err, res) => {
					expect(res).to.have.status(200);
					expect(res.body.password).to.be.a('string');
					expect(res.body.username).to.be.a('string');
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
					expect(res.body.username).to.be.a('string');
					done();
				});
		});
	});

	after('remove user', function() {
		UserSchema.find({
			username: "test"
		}).remove().exec();
	});
});