import { model, Schema, Document, Model } from 'mongoose';
import { SchoolSchema } from './School';


export let ObjectId = Schema.Types.ObjectId;

export interface intVariableDefinitionModel extends Document {
  variable: string;
  sources: Array<intVariableSource>;
};

export interface intVariableSource extends Document {
  start_year: number;
  end_year: number;
  source: string;
  table: string;
  formula: string;
  definition: string;
  notes: string;
};

const sourcesSchema = new Schema({
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
  variable: String,
  sources: [sourcesSchema]
});

schema.path('variable').validate({
  isAsync: true,
  validator: function(value, respond) {
    SchoolSchema.findOne({ "data.variable": value }, function(err,res) {
      if (!res || err) respond(false); 
      else (respond(true));
    });
  },
  message: 'Variable is not on any model!'
});

export let VariableDefinitionSchema = model<intVariableDefinitionModel>('variableDefinition', schema);

VariableDefinitionSchema.schema.static('update', (model:intVariableDefinitionModel, cb: any) => {
  return VariableDefinitionSchema.update({ variable: model.variable }, { "sources": { "$addToSet": model.sources } }, cb); 
});