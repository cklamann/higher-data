import { ChartFormula } from '../../modules/ChartFormula.module';
import { VariableDefinitionSchema, intVariableDefinitionModel } from '../../models/VariableDefinition';
import { SchoolSchema } from '../../models/School';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
import { nwData } from "../fixtures/fixtures";
import * as _ from 'lodash';
const app = require('../../app');

describe('FORMULA MODEL', function() {

	const testVar: intVariableDefinitionModel = {
		variable: "test_var",
		type: "currency",
		sources: [{
			start_year: 2015,
			end_year: 2017,
			source: "IPEDS",
			table: "test_ipeds_table",
			formula: "1+1=2",
			definition: "test definition",
			notes: "some test notes"
		}]
	}

	const testChartFormula: string = '(test_var - 5) / 5',
		testChartFormulaBad: string = '(fake_var - 5) / ( 5 * other_fake_var)',
		nwChartFormula: string = 'in_state_tuition + room_and_board';

	before('create a test school and a test variable', function(done) {
		SchoolSchema.create(nwData);
		SchoolSchema.create({
			unitid: 12345,
			data: [{
				variable: 'test_var',
				value: 10,
				fiscal_year: '2019'
			}]
		})
			.then(() => {
				VariableDefinitionSchema.create(testVar)
					.then(() => done());
			})
			.catch((err) => done(err));
	});


	describe('get the symbol nodes', function() {
		it('should return an array of symbol nodes in the formula', function(done) {
			let form1 = new ChartFormula(testChartFormulaBad);
			done();
			expect(form1.symbolNodes).to.be.an('array');
			expect(form1.symbolNodes).to.contain('fake_var');
			assert(form1.symbolNodes.length == 2);
		})
	});

	describe('validate the good formula', function() {
		it('should return true', function(done) {
			let form1 = new ChartFormula(testChartFormula);
			let validated = form1.validate()
				.then(res => {
					done();
					expect(res).to.equal(true);
				})
				.catch(err => done(err));
		});
	});

	describe('validate the bad formula', function() {
		it('should return false', function(done) {
			let form1 = new ChartFormula(testChartFormulaBad);
			let validated = form1.validate()
				.then(res => {
					done();
					expect(res).to.equal(false);
				})
				.catch(err => err);
		})
	});

	describe('transform the data', function() {
		it('should return tuition plus room and board', function(done) {
			let form1 = new ChartFormula(nwChartFormula);
			form1.execute(nwData.unitid)
				.then(res => {
					done();
					expect(res).to.be.an('array');
					//confirm it's an array of objects
					res.forEach(resp => expect(resp).to.be.an('object'));
					//confirm there's only one object per array
					res.forEach(resp => expect(Object.keys(resp)).to.have.lengthOf(1));
					//confirm that the value is numeric
					res.forEach(resp => _.values(resp).forEach(val => expect(val).to.be.a('number')));
				})
				.catch(err => err);
		})
	});

	after('remove test var', function(done) {
		VariableDefinitionSchema.find({ variable: testVar.variable }).remove().exec();
		done();
	})

	after('remove test schools', function(done) {
		SchoolSchema.find({
			unitid: 12345,
		}).remove().exec();

		SchoolSchema.findOne({ unitid: nwData.unitid }).remove().exec();
		done();
	});

});