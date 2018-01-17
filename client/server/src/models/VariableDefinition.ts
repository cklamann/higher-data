import { model, Schema, Document, Model } from 'mongoose';
import { SchoolSchema } from './School';

export let ObjectId = Schema.Types.ObjectId;

export interface intVariableDefinitionModel extends Document {
  variable: string;
  type: string;
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
  type: String,
  sources: [sourcesSchema]
});

schema.path('variable').validate({
  isAsync: true,
  validator: function(value:any, respond:any) {
    SchoolSchema.findOne({ "data.variable": value }, function(err,res) {
      if (!res || err) respond(false); 
      else (respond(true));
    });
  },
  message: 'Variable is not on any model!'
});

//todo: rethink how this thing is gonna work
// 2. FE will create, at which point IDs will be set, then FE may update, at which point you'll know the IDs, both of parent and source objects
// 3. so we'll just be adding to set if the id isn't there....

export let VariableDefinitionSchema = model<intVariableDefinitionModel>('variableDefinition', schema);

VariableDefinitionSchema.schema.static('update', (model:intVariableDefinitionModel) => {
  return VariableDefinitionSchema.update({ variable: model.variable }, { "$addToSet": {"sources": {"$each" : model.sources }}}); 
});