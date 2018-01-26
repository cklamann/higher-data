import { ChartFormula } from '../../modules/ChartFormula.module';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../../schemas/VariableDefinitionSchema';
import { SchoolSchema } from '../../schemas/SchoolSchema';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
import { nwData } from "../fixtures/fixtures";
import * as _ from 'lodash';
const app = require('../../app');

describe('FORMULA MODEL', function() {

	const testVar: intVariableDefinitionSchema = {
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

	//helpful to have minimum value on hand for proving value is there / addition got done
	let room_and_board = nwData.data.filter(datum => datum.variable === "room_and_board")
		.map(item => parseFloat(item.value)),
		min_room_and_board = _.min(room_and_board);

	const testChartFormula: string = '(test_var - 5) / 5',
		testChartFormulaBad: string = '(fake_var - 5) / ( 5 * other_fake_var)',
		nwChartFormula: string = 'in_state_tuition + room_and_board',
		optionalChartFormula: string = 'in_state_tuition + __opt_room_and_board';

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
			expect(form1.symbolNodes).to.be.an('array');
			expect(form1.symbolNodes).to.contain('fake_var');
			assert(form1.symbolNodes.length == 2);
			done();
		})
	});

	describe('validate the good formula', function() {
		it('should return true', function(done) {
			let form1 = new ChartFormula(testChartFormula);
			let validated = form1.validate()
				.then(res => {
					expect(res).to.equal(true);
					done();
				})
				.catch(err => done(err));
		});
	});

	describe('validate the bad formula', function() {
		it('should return false', function(done) {
			let form1 = new ChartFormula(testChartFormulaBad);
			let validated = form1.validate()
				.then(res => {
					expect(res).to.equal(false);
					done();
				})
				.catch(err => done(err));
		})
	});

	describe('test clean formula', function() {
		it('should return a cleaned formula from one with optional arguments', function(done) {
			let form1 = new ChartFormula('__opt_room_and_board + hat');
			assert(form1.cleanFormula == "room_and_board + hat");
			done();
		})
	});

	describe('test optional symbol nodes', function() {
		it('should return optional symbol nodes as clean variables', function(done) {
			let form1 = new ChartFormula('__opt_room_and_board + cow');
			assert(form1.optionalSymbolNodes[0] == "room_and_board");
			done();
		})
	});

	describe('return a variable with no math involved', function() {
		it('should return room and board', function(done) {

			let form1 = new ChartFormula('room_and_board');
			form1.execute(nwData.unitid)
				.then(res => {
					expect(res).to.be.an('array');
					//confirm the array has data
					expect(res.length).to.be.greaterThan(0);
					//confirm it's an array of objects
					res.forEach(resp => expect(resp).to.be.an('object'));
					//confirm there's only one kv per array
					res.forEach(resp => expect(Object.keys(resp)).to.have.lengthOf(2));
					//confirm that the value is numeric
					res.forEach(resp => _.values(resp).forEach(val => expect(parseInt(val)).to.be.a('number')));
					//confirm that each result is greater than the minimum tuition value (confirm addition happened)
					res.forEach(resp => _.values(resp).forEach(val => parseInt(val) >= min_room_and_board));
					done();
				})
				.catch(err => done(err));
		})
	});

	describe('transform the data with some simple arithmetic', function() {
		it('should return tuition plus room and board', function(done) {
			let form1 = new ChartFormula(nwChartFormula);
			form1.execute(nwData.unitid)
				.then(res => {
					expect(res).to.be.an('array');
					//confirm the array has data
					expect(res.length).to.be.greaterThan(0);
					//confirm it's an array of objects
					res.forEach(resp => expect(resp).to.be.an('object'));
					//confirm there's only one kv per array
					res.forEach(resp => expect(Object.keys(resp)).to.have.lengthOf(2));
					//confirm that the value is numeric
					res.forEach(resp => _.values(resp).forEach(val => expect(parseInt(val)).to.be.a('number')));
					//confirm that each result is greater than the minimum tuition value (confirm addition happened)
					res.forEach(resp => assert(parseFloat(resp.value) > min_room_and_board));
					done();
				})
				.catch(err => done(err));
		})
	});

	describe('test optional variable', function() {
		it('should return data with missing optional data filled in as zeroes', function(done) {
			let formula = new ChartFormula(nwChartFormula);
			formula.execute(nwData.unitid)
				.then(res => {
					expect(res).to.be.an('array');
					//confirm the array has data
					expect(res.length).to.be.greaterThan(0);
					//confirm it's an array of objects
					res.forEach(resp => expect(resp).to.be.an('object'));
					//confirm there's only one kv per array
					res.forEach(resp => expect(Object.keys(resp)).to.have.lengthOf(2));
					//confirm that the value is numeric
					res.forEach(resp => _.values(resp).forEach(val => expect(parseInt(val)).to.be.a('number')));
					//confirm that each result is greater than or equal to r&b
					res.forEach(resp => assert(parseFloat(resp.value) >= min_room_and_board));
					done();
				}).catch(err => done(err));
		});
	});

	describe('test missing variables', function() {
		it('should return an empty array', function(done) {
			let formula = new ChartFormula('room_and_board + nonexistant');
			formula.execute(nwData.unitid)
				.then(res => {
					expect(res).to.be.an('array');
					expect(res.length).to.equal(0);
					done();
				}).catch(err => done(err));
		});
	});

	after('remove test var', function(done) {
		VariableDefinitionSchema.find({ variable: testVar.variable }).remove().exec();
		done();
	})

	after('remove test schools', function(done) {
		SchoolSchema.find({
			unitid: 12345,
		}).remove().exec();

		SchoolSchema.find({ unitid: nwData.unitid }).remove().exec().then(() => done());
	});

});