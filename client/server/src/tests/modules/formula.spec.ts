import { Formula } from '../../modules/Formula.module';
import { VariableDefinitionSchema, intVariableDefinitionModel } from '../../models/VariableDefinition';
import { SchoolSchema } from '../../models/School';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
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

	const testFormula = '(test_var - 5) / 5',
		testFormulaBad = '(fake_var - 5) / ( 5 * other_fake_var)';



	before('create a test variable', function(done) {
		VariableDefinitionSchema.create(testVar, function(err, school) {
			done();
		});
	});

	before('create a test school with the test variable', function(done) {
		SchoolSchema.create({
			unitid: 12345,
			data: [{
				variable: 'test_var',
				value: 10,
				fiscal_year: '2019'
			}]
		}, function(err, school) {
			done();
		});
	});

	describe('get the symbol nodes', function() {
		it('should return an array of symbol nodes in the formula', function(done) {
			let form1 = new Formula(testFormulaBad);
			done();
			expect(form1.symbolNodes).to.be.an('array');
			expect(form1.symbolNodes).to.contain('fake_var');
			assert(form1.symbolNodes.length == 2);
		})
	});

	describe('validate the good formula', function(){
		it('should return true', function(done){
			let form1 = new Formula(testFormula);
			let validated = form1.validate(res => {
				done();
				expect(res).to.equal(true);
			});	
		})	
	});

	describe('validate the bad formula', function() {
		it('should return false', function(done) {
			let form1 = new Formula(testFormulaBad);
			let validated = form1.validate(res => {
				done();
				expect(res).to.equal(false);
			});
		})
	});

	after('remove test var', function(done) {
		VariableDefinitionSchema.find({ variable: testVar.variable }).remove().exec();
		done();
	})

	after('remove test school', function(done) {
		SchoolSchema.find({
			unitid: 12345,
		}).remove().exec();
		done();
	});

});