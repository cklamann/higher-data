import { SchoolDataSchema, intSchoolDataSchema, intExportAgg, intSchoolDataBaseQueryResult } from '../../schemas/SchoolDataSchema';
import { SchoolSchema } from '../../schemas/SchoolSchema';
import { nwData, nwData_school_data } from '../fixtures/fixtures';
import { SchoolDataAggQuery, SchoolDataQuery } from '../../modules/SchoolDataQuery.module';
import * as chai from 'chai';
import { expect } from 'chai';
require('../../app');

describe('School Data Schema', function() {

	before('create some test data', function(done) {
		SchoolDataSchema.create(nwData_school_data)
			.then(() => done())
			.catch(err => done(err));
	});

	describe('simple fetch', function() {
		it('should retrieve the expected data', function(done) {
			SchoolDataSchema.find({ unitid: nwData_school_data[0].unitid })
				.then((res: intSchoolDataSchema[]) => {
					expect(res).to.exist;
					expect(res).to.have.lengthOf(nwData_school_data.length);
					done();
				});
		});
	});

	describe('fetch variables', function() {
		it('should retrieve unique variables', function(done) {
			SchoolDataSchema.schema.statics.getVariableList()
				.then((res: string[]) => {
					expect(res).to.exist;
					expect(res).to.be.an('array');
					//arbitrary...
					expect(res).to.have.length.greaterThan(5);
					done();
				});
		});
	});

	describe('fetch only sector 3', function() {
		it('should retrieve only schools in sector 3', function(done) {
			const qc = SchoolDataQuery.createBase();
			qc.addMatch('sector', '3');
			SchoolDataSchema.schema.statics.fetch(qc)
				.then((res: intSchoolDataBaseQueryResult) => {
					expect(res).to.exist;
					expect(res).to.be.an('object');
					expect(res.data.every(datum => datum.sector === '3')).to.be.true;
					done();
				}).catch(err => done(err));
		});
	});

	describe('fetch only room_and_board for kansas and missouri, sort desc by sector, 50 per page', function() {
		it('should retrieve only schools requested', function(done) {
			const qc = SchoolDataQuery.createBase();
			qc.addMatch('variable', 'room_and_board');
			qc.addMatch('state', ['KS', 'MO']);
			qc.setPerPage(50);
			qc.setOrder('desc');
			SchoolDataSchema.schema.statics.fetch(qc)
				.then((res: intSchoolDataBaseQueryResult) => {
					expect(res).to.exist;
					expect(res).to.be.an('object');
					expect(res.data.length).to.equal(50);
					expect(res.data.every(datum => datum.state === 'KS' || datum.state === 'MO')).to.be.true;
					expect(res.data.every(datum => datum.variable === 'room_and_board')).to.be.true;
					done();
				}).catch(err => done(err));
		});
	});

	describe('fetch room_and_board for kansas and missouri schools, sort desc by 2007, 50 per page, group by name', function() {
		it('should retrieve only schools requested with correct sorting (year sort on name)', function(done) {
			const qc = SchoolDataAggQuery.createAgg();
			qc.addMatch('variable', 'room_and_board');
			qc.addMatch('state', ['KS', 'MO']);
			qc.setGroupBy('name', 'first')
			qc.setPerPage(50);
			qc.setSortField('2007');
			qc.setOrder('desc');
			SchoolDataSchema.schema.statics.fetchAggregate(qc)
				.then(res => {
					expect(res).to.exist;
					expect(res.data.length).to.equal(50);
					expect(res.data.every(datum => datum.data.every(item => item.variable === 'room_and_board'))).to.be.true;
					res.data.forEach((datum, i) => {
						if (i < res.data.length - 1) {
							expect(+datum.data.find(item => item.fiscal_year === '2007').value)
								.to.be.at.least(+res.data[i + 1].data.find(item => item.fiscal_year === '2007').value);
						}
					});
					done();
				}).catch(err => done(err));
		});
	});

	describe('fetch aggregate key sort', function() {
		it('should retrieve room and board by sector', function(done) {
			let qc = SchoolDataAggQuery.createAgg();
			qc.setOrder('desc');
			qc.setSortField('sector');
			qc.setPerPage(5);
			qc.setGroupBy('sector', 'sum');
			qc.setInflationAdjusted(false);
			qc.addMatch('variable', 'room_and_board');

			SchoolDataSchema.schema.statics.fetchAggregate(qc)
				.then((res: intExportAgg) => {
					expect(res).to.exist;
					expect(res).to.be.an('object');
					expect(res).to.have.property('data');
					expect(res.data[0]).to.have.property('sector');
					res.data.forEach(datum => expect(datum.data.filter(item => item.variable === "white_p").length).to.equal(0));
					expect(res.data.every(datum => datum.data.every(item => item.variable === "room_and_board"))).to.equal(true);
					//sort test
					res.data.forEach((datum, i) => {
						if (i < res.data.length - 1) {
							expect(+datum.sector).to.be.greaterThan(+res.data[i + 1].sector);
						}
					});
					done();
				})
				.catch(err => done(err));
		});
	});

	describe('fetch aggregate year sort', function() {
		it('should retrieve room and board by sector', function(done) {
			let qc = new SchoolDataAggQuery({
				matches: [
					{
						fieldName: 'variable',
						valuesToMatch: ['room_and_board']
					}
				],
				sort: {
					field: '2008',
					direction: 'asc'
				},
				pagination: {
					page: 1,
					perPage: 5
				},
				groupBy: {
					variable: 'sector',
					aggFunc: 'sum',
				},
				nameFilter: {
					value: '',
					fieldName: ''
				},
				inflationAdjusted: false,
			});

			SchoolDataSchema.schema.statics.fetchAggregate(qc)
				.then((res: intExportAgg) => {
					expect(res).to.exist;
					expect(res).to.be.an('object');
					expect(res).to.have.property('data');
					expect(res.data[0]).to.have.property('sector');
					res.data.forEach(datum => expect(datum.data.filter((item: any) => item.variable === "white_p").length).to.equal(0));
					expect(res.data.every(datum => datum.data.every((item: any) => item.variable === "room_and_board"))).to.equal(true);
					res.data.forEach((datum, i) => {
						if (i < res.data.length - 1) {
							expect(datum.data.find(item => item.fiscal_year == "2008" && item.variable === 'room_and_board').value)
								.to.be.at.most(res.data[i + 1].data.find((item: any) => item.fiscal_year === "2008" && item.variable === 'room_and_board').value);
						}
					});
					done();
				})
				.catch(err => done(err));
		});
	});

	after('destroy test data', function(done) {
		SchoolDataSchema.find({ unitid: nwData.unitid }).remove().exec()
			.then(() => done())
			.catch(err => done(err));
	});

});