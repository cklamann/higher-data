import { SchoolDataSchema, intSchoolDataSchema, intVarExport } from '../../schemas/SchoolDataSchema';
import { SchoolSchema } from '../../schemas/SchoolSchema';
import { nwData, nwData_school_data } from '../fixtures/fixtures';
import { intAggQueryConfig } from '../../modules/AggQueryConfig.module';
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

	describe('fetch aggregate key sort', function() {
		it('should retrieve room and board by sector', function(done) {
			let qc: intAggQueryConfig = {
				matches: [],
				sort: {
					field: 'sector',
					direction: 'desc'
				},
				pagination: {
					page: 1,
					perPage: 5
				},
				groupBy: {
					variable: 'sector',
					aggFunc:  'sum',	
				},
				inflationAdjusted: false,
				variable: 'room_and_board'
			}

			SchoolDataSchema.schema.statics.fetchAggregate(qc)
				.then((res: intVarExport) => {
					expect(res).to.exist;
					expect(res).to.be.an('object');
					expect(res).to.have.property('data');
					expect(res.data[0]).to.have.property('sector');
					res.data.forEach(datum => expect(datum.data.filter((item: any) => item.variable === "white_p").length).to.equal(0));
					expect(res.data.every(datum => datum.data.every((item: any) => item.variable === "room_and_board"))).to.equal(true);
					//sort test
					res.data.forEach((datum, i) => {
						if (i < res.data.length - 1) {
							expect(+datum.sector).to.be.lessThan(+res.data[i + 1].sector);
						}
					});
					done();
				})
				.catch(err => done(err));
		});
	});

	describe('fetch aggregate year sort', function() {
		it('should retrieve room and board by sector', function(done) {
			let qc: intAggQueryConfig = {
				matches: [],
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
					aggFunc:  'sum',	
				},
				inflationAdjusted: false,
				variable: 'room_and_board'
			}

			SchoolDataSchema.schema.statics.fetchAggregate(qc)
				.then((res: intVarExport) => {
					expect(res).to.exist;
					expect(res).to.be.an('object');
					expect(res).to.have.property('data');
					expect(res.data[0]).to.have.property('sector');
					res.data.forEach(datum => expect(datum.data.filter((item: any) => item.variable === "white_p").length).to.equal(0));
					expect(res.data.every(datum => datum.data.every((item: any) => item.variable === "room_and_board"))).to.equal(true);
					res.data.forEach((datum, i) => {
						if (i < res.data.length - 1) {
							expect(datum.data.find(item => item.fiscal_year == "2008" && item.variable === qc.variable).value)
								.to.be.at.least(res.data[i + 1].data.find((item: any) => item.fiscal_year === "2008" && item.variable === qc.variable).value);
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