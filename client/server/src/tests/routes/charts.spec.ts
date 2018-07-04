import { UserSchema } from '../../schemas/UserSchema';
import { nwData, nwData_school_data } from '../fixtures/fixtures';
import { VariableDefinitionSchema, intVariableDefinitionSchema, intVariableDefinitionModel } from '../../schemas/VariableDefinitionSchema';
import { SchoolSchema } from '../../schemas/SchoolSchema';
import { SchoolDataSchema } from '../../schemas/SchoolDataSchema';
import * as assert from 'assert';
import * as chai from 'chai';
const chaiHttp = require('chai-http');
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ChartSchema, intChartSchema, intChartVariableModel, intChartModel } from '../../schemas/ChartSchema';
const app = require('../../app');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const connection = chai.request(app);
const agent = chai.request.agent(app);

describe("CHART ROUTE", () => {

	const username = "tester",
		password = "schmester";

	const creds = Buffer.from(`${username}:${password}`).toString('base64');

	before('create user', function() { //route is now protected, won't work
		UserSchema.create({
			username: username,
			password: password
		})
	});

	const testVar1: intVariableDefinitionModel = {
		variable: "test_var_1",
		friendlyName: '',
		category: '',
		valueType: "currency0",
		sources: [{
			startYear: '2015',
			endYear: '2017',
			source: "IPEDS",
			table: "test_ipeds_table",
			formula: "source formula doesn't matter",
			definition: "test definition",
			notes: "some test notes"
		}]
	}

	before('seed data and create a test school and variables', function(done) {
		SchoolSchema.create(nwData)
			.then(() => SchoolDataSchema.create(nwData_school_data))
			.then(() => VariableDefinitionSchema.create([testVar1]))
			.then(() => done())
			.catch(err => done(err));
	});

	const testChart: intChartModel = {
		name: 'fake_chart',
		type: 'line',
		category: 'fake',
		active: true,
		slug: 'the-slug',
		valueType: 'currency',
		description: 'sweet chart',
		cuts: [],
		variables: [{
			formula: '1+test_var_1',
			notes: 'test notes',
			legendName: 'test legend'
		}]
	};

	const newVariable: intChartVariableModel = {
		formula: '1+2+test_var_1',
		notes: 'more test notes',
		legendName: 'a test legend'
	}

	describe('create', () => {
		it('Post should return status 200 and newly created chart, then update it', done => {
			connection.post('/api/charts')
				.set('Authorization', `Basic ${creds}`)
				.send(testChart)
				.end((err, res) => {
					if (err) done(err);
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('object');
					expect(res.body).to.haveOwnProperty('valueType').that.is.a('string');
					expect(res.body.variables).to.be.an('array');
					res.body.variables.push(newVariable);
					res.body.type = "updated type";
					return agent.post('/api/charts')
						.set('Authorization', `Basic ${creds}`)
						.send(res.body)
						.end((err, res) => {
							expect(res).to.have.status(200);
							expect(res.body).to.be.an('object');
							expect(res.body).to.haveOwnProperty('valueType').that.is.a('string');
							expect(res.body).to.haveOwnProperty('type').that.equals('updated type');
							expect(res.body.variables).to.be.an('array');
							assert.equal(res.body.variables.length, 2);
							assert.equal(res.body.type, "updated type");
							done();
						});
				});
		});
	});

	describe('fetch all', () => {
		it('should return 200 with all the charts', done => {
			connection.get('/api/charts')
				.then(res => {
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('array');
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

	after('remove test org and variables', function(done) {
		VariableDefinitionSchema.find({ variable: { "$in": ["test_var_1", "test_var_2"] } }).remove().exec()
			.then(() => SchoolSchema.find({ unitid: nwData.unitid }).remove().exec())
			.then(() => SchoolDataSchema.find({ unitid: nwData.unitid }).remove().exec())
			.then(() => done()).catch(err => done(err));
	})
});