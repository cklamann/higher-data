import { VariableDefinitionSchema, intVariableDefinitionModel, intVariableSource } from '../../models/VariableDefinition';
import { SchoolSchema } from '../../models/School';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
const app = require('../../app');

describe('Variable Definition Model', function() {

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

  before('create school', function(done) {
    SchoolSchema.create({
      unitid: 12345,
      data: [{
        variable: 'test_var',
        value: 4,
        fiscal_year: '2019'
      }]
    }, function(err, school) {
      done();
    });
  });

  describe('test school exists with test var', function() {
    it('should return without error', function(done) {
      SchoolSchema.findOne({ unitid: 12345 }, function(err) {
        if (err) done(err);
        else done();
      }).then(function(res) {
        assert.equal(res.unitid, 12345);
        expect(res).to.deep.include({ variable: 'test_var' })
      });
    });
  })

  describe('#save()', function() {
    it('should save without error', function(done) {
      var variable = new VariableDefinitionSchema(testVar);
      variable.save(function(err) {
        if (err) done(err);
        else done();
      }).then(function(resVar) {
        assert.equal(resVar, testVar);
      });
    });
  });

  describe('#dontSaveInvalid()', function() {
    it('should throw validation error', function(done) {
      let badTestVar = testVar;
      testVar.variable = "fake_var";
      let badModel = new VariableDefinitionSchema(badTestVar);
      done();
      expect(() => badModel.validate()).to.throw('variableDefinition validation failed: variable: Variable is not on any model!');
    });
  });

  describe('#update()', function() {
    it('should update source array without duplicating', function(done) {
      let payload = {
        variable: testVar.variable,
        sources: [{
          start_year: 2015,
          end_year: 2017,
          source: "IPEDS",
          table: "test_ipeds_table",
          formula: "1+1=2",
          definition: "test definition",
          notes: "some updated notes!"
        }],
      };

      VariableDefinitionSchema.schema.statics.update(payload, function(err, variable) {
        if (err) done(err);
      });

      VariableDefinitionSchema.findOne({ variable: payload.variable }, function(err, variable) {
        console.log(variable);
        done();
        assert.equal(variable.sources.length, 1);
        assert.equal(variable.sources[0].notes, "some updated notes!");
      });
    });
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