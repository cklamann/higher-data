import { model, Schema, Document, Model } from 'mongoose';
import { SchoolSchema } from './SchoolSchema';

export interface intVariableDefinitionModel {
  variable: string;
  valueType: string;
  friendlyName:string;
  category:string;
  sources: Array<intVariableSourceModel>;
};

export interface intVariableDefinitionSchema extends intVariableDefinitionModel, Document {
  _id: Schema.Types.ObjectId,
  sources: intVariableSourceSchema[];
};

export interface intVariableSourceModel {
  startYear: string;
  endYear: string;
  source: string;
  table: string;
  formula: string;
  definition: string;
  notes: string;
};

export interface intVariableSourceSchema extends intVariableSourceModel, Document { };

const sourcesSchema = new Schema({
  startYear: String,
  endYear: String,
  source: String,
  table: String,
  formula: String,
  definition: String,
  notes: String
}, { _id: false });

const schema: Schema = new Schema({
  valueType: String,
  friendlyName: {
    type: String,
    unique: true
  },
  variable: {
    type: String,
    unique: true
  },
  sources: [sourcesSchema]
});

schema.path('variable').validate({
  isAsync: true,
  validator: function(value: any, respond: any) {
    SchoolSchema.findOne({ "data.variable": value })
      .then(res => {
        if (!res) respond(false);
        else (respond(true));
      }).catch(err => respond(err));
  },
  message: 'Variable is not on any model!'
});

export let variableSourcesSchema = model<intVariableSourceSchema>('variable_source', sourcesSchema)
export let VariableDefinitionSchema = model<intVariableDefinitionSchema>('variable_definition', schema);

VariableDefinitionSchema.schema.statics = {
  fetchAndUpdate: (model: intVariableDefinitionSchema): Promise<intVariableDefinitionSchema> => {
    const schema = new VariableDefinitionSchema(model);
    return schema.validate()
      .then(() => VariableDefinitionSchema.findByIdAndUpdate(model._id, model, { new: true }));
    //.catch(err => err);  //todo: catch error and send back useful response
  }
}