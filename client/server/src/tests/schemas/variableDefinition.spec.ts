import { VariableDefinitionSchema, intVariableDefinitionSchema, intVariableDefinitionModel, intVariableSourceModel, variableSourcesSchema } from '../../schemas/VariableDefinitionSchema';
import { SchoolSchema, intSchoolSchema } from '../../schemas/SchoolSchema';
import { SchoolDataSchema } from '../../schemas/SchoolDataSchema';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
import * as _ from 'lodash';
const app = require('../../app');
chai.use(chaiAsPromised);
const assert = chai.assert;


describe('Variable Definition Schema', function() {

  const testVar: intVariableDefinitionModel = {
    variable: "test_var",
    valueType: "currency",
    friendlyName: '',
    category: '',
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

  before('create school', done => {
    SchoolSchema.create({ unitid: "12345" })
      .then(() => SchoolDataSchema.create({
        name: 'asdf',
        state: 'MA',
        sector: "6",
        unitid: '12345',
        variable: 'test_var',
        value: "4",
        fiscal_year: '2019'
      }))
      .then(() => VariableDefinitionSchema.create(testVar))
      .then(() => done())
      .catch(err => done(err));
  });

  describe('test school exists with test var', function() {
    it('should return without error', function(done) {
      SchoolSchema.findOne({ unitid: '12345' }).populate('school_data').exec()
        .then(res => {
          assert.equal(res.unitid, '12345');
          expect(res.school_data).to.have.lengthOf(1);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('#dontSaveInvalid()', function() {
    it('should throw validation error', function() {
      let badTestVar = _.cloneDeep(testVar);
      badTestVar.variable = "fake_var";
      let badModel = new VariableDefinitionSchema(badTestVar);
      return assert.isRejected(badModel.validate(), "variable_definition validation failed: variable: Variable is not on any model!");
    });
  });

  describe('#update()', function() {
    it('should update source array with a new source object and a new source value', function(done) {
      let newSource = new variableSourcesSchema({
        startYear: "2019",
        endYear: "2020",
        source: "IPEDS",
        table: "test_ipeds_table",
        formula: "2+2=4",
        definition: "some other test definition",
        notes: "some other notes!"
      });

      VariableDefinitionSchema.findOne({ variable: testVar.variable }).exec()
        .then(res => {
          console.log(res);
          res.sources[0].source = "new fancy updated source!";
          res.sources.push(newSource);
          return VariableDefinitionSchema.schema.statics.fetchAndUpdate(res);
        }).then(variable => {
          done();
          assert.equal(variable.sources.length, 2);
          expect(variable.sources[0]).to.include({ "source": "new fancy updated source!" });
          expect(variable.sources[0]).to.not.include({ "source": "new fancy imagined source!" });
          expect(variable.sources[1]).to.include({ "notes": "some other notes!" });
        })
        .catch(err => done(err));
    });
  });
  after('remove test var', function(done) {
    VariableDefinitionSchema.find({ variable: testVar.variable }).remove().exec().then(() => done());
  });

  after('remove test school', function(done) {
    SchoolSchema.find({ unitid: "12345" }).remove().exec();
    SchoolDataSchema.find({ unitid: "12345" }).remove().exec()
      .then(() => done())
      .catch(err => done(err));
  });
});