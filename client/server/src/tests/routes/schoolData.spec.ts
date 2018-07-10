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
	it('should return 200 with first 7 missouri rows', done => {
		connection.get('/api/school-data?match1var=state&match1vals=MO&perPage=7&page=1')
			.then(res => {
				expect(res).to.have.status(200);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data.length).to.equal(7);
				console.log(res.body.data);
				res.body.data.forEach(item => expect(item).has.property('name'));
				done();
			}).catch(err => done(err));
	})
});

describe('fetch for missouri', () => {
	it('should return 200 with first 7 missouri rows that have university of in their name', done => {
		connection.get('/api/school-data?match1var=state&match1vals=MO&perPage=7&page=1&qField=name&qVal=university of')
			.then(res => {
				expect(res).to.have.status(200);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data.length).to.equal(7);
				console.log(res.body.data);
				expect(res.body.data.every(item => /university of/ig.test(item.name))).to.equal(true);
				done();
			}).catch(err => done(err));
	})
});

describe('fetch for missouri sector 2 schools', () => {
	it('should return 200 with first 7 missouri sector 2 rows', done => {
		connection.get('/api/school-data?match1var=state&match1vals=MO&match2var=sector&match2vals=2&perPage=7&page=1')
			.then(res => {
				expect(res).to.have.status(200);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data.length).to.equal(7);
				done();
			}).catch(err => done(err));
	})
});

describe('fetch aggregate for missouri', () => {
	it('should return 200 with avg missouri and kansas room and board', done => {
		connection.get('/api/school-data?match1var=state&match1vals=MO,KS&match2var=variable&match2vals=room_and_board&type=aggregate&gbFunc=avg&gbField=state&perPage=7&page=1')
			.then(res => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data.length).to.equal(2);
				done();
			}).catch(err => done(err));
	})
});