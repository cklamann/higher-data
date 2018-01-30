import { model, Schema, Document, Model } from 'mongoose';
import { SchoolSchema } from './SchoolSchema';
import * as Util from '../modules/Util.module';

let ObjectId = Schema.Types.ObjectId;

export interface intVariableDefinitionModel {
  variable: string;
  type: string;
  sources: Array<intVariableSourceModel>;
};

export interface intVariableDefinitionSchema extends intVariableDefinitionModel, Document { 
  sources: intVariableSourceSchema[];
};

export interface intVariableSourceModel {
  start_year: number;
  end_year: number;
  source: string;
  table: string;
  formula: string;
  definition: string;
  notes: string;
};

export interface intVariableSourceSchema extends intVariableSourceModel, Document { };

const sourcesSchema = new Schema({
  id: ObjectId,
  start_year: Number,
  end_year: Number,
  source: String,
  table: String,
  formula: String,
  definition: String,
  notes: String
});

const schema: Schema = new Schema({
  id: ObjectId,
  type: String,
  variable: String,
  sources: [sourcesSchema]
});

schema.path('variable').validate({
  isAsync: true,
  validator: function(value: any, respond: any) {
    SchoolSchema.findOne({ "data.variable": value })
      .then( res => {
        if (!res) respond(false);
        else (respond(true));
      }).catch( err => respond(err));
  },
  message: 'Variable is not on any model!'
});

export let variableSourcesSchema = model<intVariableSourceSchema>('variable_source', sourcesSchema)
export let VariableDefinitionSchema = model<intVariableDefinitionSchema>('variable_definition', schema);

VariableDefinitionSchema.schema.static('update', (model: intVariableDefinitionSchema) => {
  return VariableDefinitionSchema.findById(model._id).exec()
    .then(variable => {
      variable.type = model.type;
      variable.sources = Util.updateArray(variable.sources, model.sources);
      return variable.save();
    }).then(() => VariableDefinitionSchema.findById(model._id).exec())
});