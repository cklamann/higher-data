import assert = require('assert');
import chai = require('chai');
import chaiHttp = require('chai-http'); 
import { expect } from 'chai';
import chaiAsPromised = require('chai-as-promised');
const app = require('../../app');
chai.use(chaiHttp);
chai.use(chaiAsPromised);
const connection = chai.request(app);

describe('fetch for missouri', () => {
		it('should return 200 with first 500 missouri rows', done => {
			connection.get('/api/school-data?match1var=state&match1vals=MO&perPage=500&page=1')
				.then(res => {
					expect(res).to.have.status(200);
					expect(res.body).to.be.an('array');
					expect(res.body.length).to.equal(500);
					done();
				}).catch(err => done(err));
		})
	});