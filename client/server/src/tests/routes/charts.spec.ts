import { UserSchema } from '../../schemas/UserSchema';
import * as assert from 'assert';
import * as chai from 'chai';
const chaiHttp = require('chai-http');
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ChartSchema, intChartModel, intChartVariable } from '../../schemas/ChartSchema';
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
		slug: 'the-slug',
		valueType: 'currency',
		description: 'sweet chart',
		variables: [{
			formula: '1+2',
			notes: 'test notes',
			legendName: 'test legend'
		}]
	};

	const newVariables: intChartVariable = {
		formula: '1+2+3',
		notes: 'more test notes',
		legendName: 'a test legend'
	}

	describe('create', () => {
		it('Post should return status 200 and newly created chart', done => {
			connection.post('/api/charts')
				.set('Authorization', `Basic ${username}:${password}`)
				.send(testChart)
				.end((err, res) => {
					if (err) done(err);
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('object');
					expect(res.body).to.haveOwnProperty('valueType').that.is.a('string');
					expect(res.body.variables).to.be.an('array');
					done();
				});
		});
	});

	describe('update', () => {
		it('Post should return status 200 and newly updated chart', done => {
			testChart.variables.push(newVariables);
			testChart.type = "updated type";
			connection.post('/api/charts')
				.set('Authorization', `Basic ${username}:${password}`)
				.send(testChart)
				.end((err, res) => {
					if (err) done(err);
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('object');
					expect(res.body).to.haveOwnProperty('valueType').that.is.a('string');
					expect(res.body.variables).to.be.an('array');
					assert.equal(res.body.variables.length, 2);
					assert.equal(res.body.type, "updated type");
					done();
				});
		});
	});

	describe('fetch all', () => {
		it('should return 200 with all the charts', done => {
			connection.get('/api/charts')
				.then(res => {
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('array');
					console.log(res.body);
					done();
				}).catch(err => done(err));
		})
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