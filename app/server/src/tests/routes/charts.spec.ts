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

});