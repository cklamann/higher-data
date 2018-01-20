import { UserSchema } from '../../schemas/UserSchema';
import * as assert from 'assert';
import * as chai from 'chai';
//import * as chaiHttp from 'chai-http'; 
const chaiHttp = require('chai-http') //doing this until updeate when it can be imported in es6 style....
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { SchoolSchema } from '../../schemas/SchoolSchema';
const app = require('../../app');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const connection = chai.request(app);

describe("VARIABLE ROUTE", () => {

	const username = "tester",
		password = "schmester";

	before('create user', function() {
		UserSchema.create({
			username: username,
			password: password
		})
	});

	before('create school', function(done) {
		SchoolSchema.create({
			unitid: 12345,
			data: [{
				variable: 'test_var',
				value: 4,
				fiscal_year: '2019'
			}]
		}, function(err, school) {
			done();
		});
	});

	describe('fetch all', () => {
		it('Post should return status 200', done => {
			connection.get('/api/variables')
				.set('Authorization', `Basic ${username}:${password}`)
				.end((err, res) => {
					if (err) done(err);
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('array');
					done();
				});
		});
	});

	after('remove user', function() {
			UserSchema.find({
				username: "tester"
			}).remove().exec();
		});

	after('remove test school', function(done) {
		SchoolSchema.find({
			unitid: 12345,
		}).remove().exec();
		done();
	});
});