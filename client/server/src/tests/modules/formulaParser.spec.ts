import { FormulaParser, intFormulaParserResult } from '../../modules/FormulaParser.module';
import { VariableDefinitionSchema, intVariableDefinitionSchema, intVariableDefinitionModel } from '../../schemas/VariableDefinitionSchema';
import { SchoolSchema, intSchoolModel } from '../../schemas/SchoolSchema';
import { intSchoolDataModel, intSchoolDataSchema } from '../../schemas/SchoolDataSchema';
import { SchoolDataSchema } from '../../schemas/SchoolDataSchema';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
import { nwData, nwData_school_data } from "../fixtures/fixtures";
import * as _ from 'lodash';
const app = require('../../app');

describe('FORMULA PARSER', function() {

	const testVar: intVariableDefinitionModel = {
		category: '',
		friendlyName: "",
		variable: "test_var",
		valueType: "currency",
		sources: [{
			startYear: "2015",
			endYear: "2017",
			source: "IPEDS",
			table: "test_ipeds_table",
			formula: "1+1=2",
			definition: "test definition",
			notes: "some test notes"
		}]
	}

	const dataWithIncompleteYear: any[] = [
		{ sector: nwData.sector, state: nwData.state, name: nwData.name, variable: "in_state_tuition", fiscal_year: "2003", value: "50", unitid: "000001" },
		{ sector: nwData.sector, state: nwData.state, name: nwData.name, variable: "in_state_tuition", fiscal_year: "2004", value: "60", unitid: "000001" },
		{ sector: nwData.sector, state: nwData.state, name: nwData.name, variable: "room_and_board", fiscal_year: "2003", value: "70", unitid: "000001" },
		{ sector: nwData.sector, state: nwData.state, name: nwData.name, variable: "room_and_board", fiscal_year: "2004", value: "80", unitid: "000001" },
		{ sector: nwData.sector, state: nwData.state, name: nwData.name, variable: "room_and_board", fiscal_year: "2005", value: "90", unitid: "000001" },
	]

	const schoolMissingOneYearOfTuition: intSchoolModel = _.cloneDeep(nwData);
	schoolMissingOneYearOfTuition.unitid = "000001";
	const schoolMissingOneYearOfTuition_school_data = dataWithIncompleteYear;

	//helpful to have minimum value on hand for proving value is there / addition got done
	const room_and_board = nwData_school_data.filter(datum => datum.variable === "room_and_board")
		.map(item => item.value),
		min_room_and_board = _.min(room_and_board);

	const testFormula: string = '(test_var - 5) / 5',
		testFormulaBad: string = '(fake_var - 5) / ( 5 * other_fake_var)',
		nwFormula: string = 'in_state_tuition + room_and_board',
		optionalFormula: string = '__opt_in_state_tuition + room_and_board';

	before('create test school with incomplete variable', function(done) {
		SchoolSchema.create(schoolMissingOneYearOfTuition)
			.then(() => SchoolDataSchema.create(schoolMissingOneYearOfTuition_school_data))
			.then(() => done())
			.catch((err) => done(err));
	});

	before('create test schools and a test variable', function(done) {
		SchoolSchema.create(nwData)
			.then(() => SchoolDataSchema.create(nwData_school_data))
			.then(() => SchoolSchema.create({ unitid: "12345" }))
			.then(() => SchoolDataSchema.create({
				name: "bleh",
				state: "MA",
				sector: "5",
				variable: 'test_var',
				value: 10,
				fiscal_year: '2019',
				unitid: "12345"
			}))
			.then(() => VariableDefinitionSchema.create(testVar))
			.then(() => done())
			.catch(err => done(err));
	});


	describe('get the symbol nodes', function() {
		it('should return an array of symbol nodes in the formula', function(done) {
			let form1 = new FormulaParser(testFormulaBad);
			expect(form1.symbolNodes).to.be.an('array');
			expect(form1.symbolNodes).to.contain('fake_var');
			assert(form1.symbolNodes.length == 2);
			done();
		})
	});

	describe('validate the good formula', function() {
		it('should return true', function(done) {
			let form1 = new FormulaParser(testFormula);
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
			let form1 = new FormulaParser(testFormulaBad);
			let validated = form1.validate()
				.then(res => {
					expect(res).to.equal(false);
					done();
				})
				.catch(err => done(err));
		})
	});

	describe('test that parser strips __opt_ prefix', function() {
		it('should return a cleaned formula from one with optional arguments', function(done) {
			let form1 = new FormulaParser('__opt_room_and_board + hat');
			assert(form1.cleanFormula == "room_and_board + hat");
			done();
		})
	});

	describe('test that optional symbol nodes exist', function() {
		it('should return optional symbol nodes as clean variables', function(done) {
			let form1 = new FormulaParser('__opt_room_and_board + cow');
			assert(form1.optionalSymbolNodes[0] == "room_and_board");
			done();
		})
	});

	describe('return a variable with no math involved', function() {
		it('should return room and board', function(done) {
			let form1 = new FormulaParser('room_and_board');
			form1.execute(nwData.unitid)
				.then(res => {
					expect(res).to.be.an('array');
					//confirm the array has data
					expect(res.length).to.be.greaterThan(0);
					//confirm it's an array of objects
					res.forEach(resp => expect(resp).to.be.an('object'));
					//confirm there's only one two properties (value and fiscal year) per object
					res.forEach(resp => expect(Object.keys(resp)).to.have.lengthOf(2));
					//confirm that the value is numeric
					res.forEach(resp => expect(resp.value).to.be.a('number'));
					//confirm that each result is greater than or equal to the minimum tuition value 
					res.forEach(resp => expect(resp.value >= min_room_and_board));
					done();
				})
				.catch(err => done(err));
		})
	});

	describe('transform the data with some simple arithmetic', function() {
		it('should return tuition plus room and board', function(done) {
			let form1 = new FormulaParser(nwFormula);
			form1.execute(nwData.unitid)
				.then((res: intFormulaParserResult[]) => {
					expect(res).to.be.an('array');
					//confirm the array has data
					expect(res.length).to.be.greaterThan(0);
					//confirm it's an array of objects
					res.forEach(resp => expect(resp).to.be.an('object'));
					//confirm there's only one kv per array
					res.forEach(resp => expect(Object.keys(resp)).to.have.lengthOf(2));
					//confirm that the value is numeric
					res.forEach(resp => expect(resp.value).to.be.a('number'));
					//confirm that each result is greater than the minimum tuition value (confirm addition happened)
					res.forEach(resp => expect(resp.value >= min_room_and_board));
					done();
				})
				.catch(err => done(err));
		})
	});

	describe('test optional variable where value exists', function() {
		it('should return correct result for present optional variable', function(done) {
			let formula = new FormulaParser(optionalFormula);
			formula.execute(nwData.unitid)
				.then((res: intFormulaParserResult[]) => {
					expect(res).to.be.an('array');
					//confirm the array has data
					expect(res.length).to.be.greaterThan(0);
					//confirm it's an array of objects
					res.forEach(resp => expect(resp).to.be.an('object'));
					//confirm there's only one kv per array
					res.forEach(resp => expect(Object.keys(resp)).to.have.lengthOf(2));
					//confirm that the value is numeric
					res.forEach(resp => expect(resp.value).to.be.a('number'));
					//confirm that each result is greater than the minimum tuition value (confirm addition happened)
					res.forEach(resp => expect(resp.value >= min_room_and_board));
					done();
				}).catch(err => done(err));
		});
	});

	describe('test optional variable where value does not exist', function() {
		it('should return data with missing optional data filled in as zeroes', function(done) {
			let formula = new FormulaParser(optionalFormula);
			formula.execute(schoolMissingOneYearOfTuition.unitid)
				.then((res: intFormulaParserResult[]) => {
					expect(res).to.be.an('array');
					//confirm the array has data
					expect(res.length).to.equal(3);
					//confirm it's an array of objects
					res.forEach(resp => expect(resp).to.be.an('object'));
					//confirm there's only one kv per array
					res.forEach(resp => expect(Object.keys(resp)).to.have.lengthOf(2));
					//confirm that the value is numeric
					res.forEach(resp => expect(resp.value).to.be.a('number'));
					//confirm that each result is greater than the minimum tuition value (confirm addition happened)
					res.forEach(resp => expect(resp.value === min_room_and_board));
					done();
				}).catch(err => done(err));
		});
	});

	describe('test missing variables', function() {
		it('should return an empty array', function(done) {
			let formula = new FormulaParser('room_and_board + nonexistant');
			formula.execute(nwData.unitid)
				.then(res => {
					expect(res).to.be.an('array');
					expect(res.length).to.equal(0);
					done();
				}).catch(err => done(err));
		});
	});

	describe('test missing year', function() {
		it('should return 2 years worth of data because one was filtered out', function(done) {
			let formula = new FormulaParser('room_and_board + in_state_tuition');
			formula.execute(schoolMissingOneYearOfTuition.unitid)
				.then(res => {
					console.log(res);
					expect(res).to.be.an('array');
					expect(res.length).to.equal(2);
					done();
				}).catch(err => done(err));
		});
	});

	after('remove test var', function(done) {
		VariableDefinitionSchema.find({ variable: testVar.variable }).remove().exec();
		done();
	})

	after('remove test schools', function(done) {
		SchoolSchema.find({ unitid: { "$in": [nwData.unitid, schoolMissingOneYearOfTuition.unitid, "12345"] } }).remove().exec()
			.then(() => SchoolDataSchema.find({ unitid: { "$in": [nwData.unitid, schoolMissingOneYearOfTuition.unitid, "12345"] } }).remove().exec())
			.then(() => done());
	});

});