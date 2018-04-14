import { SchoolDataSchema, intSchoolDataSchema, intVarExport } from '../../schemas/SchoolDataSchema';
import { SchoolSchema } from '../../schemas/SchoolSchema';
import { nwData, nwData_school_data } from '../fixtures/fixtures';
import { intQueryConfig } from '../../types/types';
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

	describe('fetch with school names', function() {
		it('should retrieve the variables grouped by school names', function(done) {
			let qc: intQueryConfig = {
				matches: [],
				sort: {
					field: '',
					direction: ''
				},
				pagination: {
					page: 1,
					perPage: 10
				},
				inflationAdjusted: 'false', //todo:update to boolean
				filters: {
					fieldName: 'variable',
					values: ['room_and_board']
				}
			}

			SchoolDataSchema.schema.statics.fetchWithSchoolNames(qc)
				.then((res: intVarExport) => {
					expect(res).to.exist;
					expect(res).to.be.an('object');
					expect(res).to.have.property('data');
					expect(res.data[0]).to.have.property('instnm');
					expect(res.data[0]).to.not.have.property('_id');
					//first page
					expect(res.data).to.have.length(10);
					//default ascending sort
					res.data.forEach(school => expect(school.instnm.slice(0, 1).toLowerCase() < "b").to.be.true);
					expect(res.query.pagination.total).to.be.greaterThan(10);
					done();
				})
				.catch(err => done(err));
		});
	});

	describe('fetch with school names and sort by year', function() {
		it('should retrieve the variables grouped by school names  and sort by year', function(done) {
			let qc: intQueryConfig = {
				matches: [],
				sort: {
					field: '2008',
					direction: '-'
				},
				pagination: {
					page: 3,
					perPage: 50
				},
				inflationAdjusted: 'false',
				filters: {
					fieldName: 'variable',
					values: ['room_and_board', 'in_state_tuition']
				}
			}

			SchoolDataSchema.schema.statics.fetchWithSchoolNames(qc)
				.then((res: intVarExport) => {
					expect(res).to.exist;
					expect(res).to.be.an('object');
					expect(res).to.have.property('data');
					expect(res.data[0]).to.have.property('instnm');
					res.data.forEach(datum => expect(datum.data.filter((item: any) => item.variable === "white_p").length).to.equal(0));
					expect(res.data.some(datum => datum.data.filter((item: any) => item.variable === "room_and_board").length > 0)).to.equal(true);
					expect(res.data.some(datum => datum.data.filter((item: any) => item.variable === "in_state_tuition").length > 0)).to.equal(true);
					res.data.forEach((datum, i) => {
						if (i < res.data.length - 1) {
							expect(datum.data.find(item => item.fiscal_year == "2008" && item.variable === qc.filters.values[0]).value)
								.to.be.at.least(res.data[i + 1].data.find((item: any) => item.fiscal_year === "2008" && item.variable === qc.filters.values[0]).value);
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