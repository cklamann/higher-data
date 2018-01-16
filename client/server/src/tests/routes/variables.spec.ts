import { UserSchema } from '../../models/User';
import assert = require('assert');
import chai = require('chai');
import chaiHttp = require('chai-http'); //http://chaijs.com/plugins/chai-http/n
import { expect } from 'chai';
import chaiAsPromised = require('chai-as-promised');
const app = require('../../app');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const connection = chai.request(app);

describe("FETCH ALL", () => {

	const username = "tester",
		password = "schmester";

	before('create user', function() {
		UserSchema.create({
			username: username,
			password: password
		})
	});

	it('Post should return status 200', done => {
		connection.get('/api/variables')
			.set('Authorization', `Basic ${username}:${password}`)
			.end((err, res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('array');
				done();
			});
	});

	after('remove user', function() {
		UserSchema.find({
			username: "tester"
		}).remove().exec();
	});
});