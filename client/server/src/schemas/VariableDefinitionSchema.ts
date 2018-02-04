import { model, Schema, Document, Model } from 'mongoose';
import { SchoolSchema } from './SchoolSchema';

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
  id: ObjectId,
  startYear: String,
  endYear: String,
  source: String,
  table: String,
  formula: String,
  definition: String,
  notes: String
});

const schema: Schema = new Schema({
  id: ObjectId,
  type: String,
  variable: {
    type:String,
    unique:true
  },
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

VariableDefinitionSchema.schema.statics = {
  fetchAndUpdate: (model: intVariableDefinitionModel): Promise<intVariableDefinitionSchema> => {
    const newSchema = new VariableDefinitionSchema(model);
    return newSchema.validate()
      .then(() => {
        return newSchema.update(newSchema)
          .then(() => newSchema);
      });
  }
}