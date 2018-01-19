import { UserSchema } from '../../models/User';
import * as assert from 'assert';
import * as chai from 'chai';
const chaiHttp = require('chai-http');
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ChartSchema, intChartModel } from '../../models/Chart';
const app = require('../../app');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const connection = chai.request(app);

describe("CHART ROUTE", () => {

	const username = "tester",
		password = "schmester";

	before('create user', function() {
		UserSchema.create({
			username: username,
			password: password
		})
	});

	const testChart: intChartModel = {
		name: 'fake_chart',
		type: 'line',
		category: 'fake',
		active: true,
		valueType: 'currency',
		description: 'sweet chart',
		variables: [{
			formula: '1+2',
			notes: 'test notes',
			legendName: 'test legend'
		}]
	};

	describe('create', () => {
		it('Post should return status 200', done => {
			connection.post('/api/charts')
				.set('Authorization', `Basic ${username}:${password}`)
				.send({})
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

	after('remove test chart', function(done) {
		ChartSchema.find({
			name: testChart.name
		}).remove().exec();
		done();
	});
});