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
				res.body.data.forEach(item => expect(item).has.property('name'));
				done();
			}).catch(err => done(err));
	})
});

describe('fetch for missouri with name filter', () => {
	it('should return 200 with first 7 missouri rows that have university of in their name', done => {
		connection.get('/api/school-data?match1var=state&match1vals=MO&perPage=7&page=1&qField=name&qVal=university of')
			.then(res => {
				expect(res).to.have.status(200);
				expect(res.body.data).to.be.an('array');
				expect(res.body.data.length).to.equal(7);
				expect(res.body.data.every(item => /university of/ig.test(item.name))).to.equal(true);
				done();
			}).catch(err => done(err));
	})
});

describe('fetch for missouri with two match filters', () => {
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
		connection.get('/api/school-data?match1var=state&match1vals=MO,KS&match2var=variable&match2vals=room_and_board&gbFunc=avg&gbField=state&perPage=7&page=1')
			.then(res => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data.length).to.equal(2);
				done();
			}).catch(err => done(err));
	})
});

describe('fetch aggregate with a match filter', () => {
	it('should return 200 with avg missouri and kansas room and board', done => {
		connection.get('/api/school-data?match1vals=room_and_board&match1var=variable&gbFunc=avg&gbField=state&perPage=7&page=1&sort=2007&order=asc')
			.then(res => {
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('object');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data.length).to.equal(7);
				res.body.data.forEach((datum, i) => {
					if (i < res.body.data.length - 1) {
						expect(datum.data.find(item => item.fiscal_year == "2007" && item.variable === 'room_and_board').value)
							.to.be.at.most(res.body.data[i + 1].data.find((item: any) => item.fiscal_year === "2007" && item.variable === 'room_and_board').value);
					}
				});
				done();
			}).catch(err => done(err));
	});
});