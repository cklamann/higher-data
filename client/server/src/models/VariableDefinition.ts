import { model, Schema, Document, Model } from 'mongoose';
import { SchoolSchema } from './School';
import * as Q from 'q';
import * as _ from 'lodash';

let ObjectId = Schema.Types.ObjectId;

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
  validator: function(value:any, respond:any) {
    SchoolSchema.findOne({ "data.variable": value }, function(err, res) {
      if (!res || err) respond(false);
      else (respond(true));
    });
  },
  message: 'Variable is not on any model!'
});

export let variableSourcesSchema = model<intVariableSource>('variableSource', sourcesSchema)
export let VariableDefinitionSchema = model<intVariableDefinitionModel>('variableDefinition', schema);

VariableDefinitionSchema.schema.static('update', (model: intVariableDefinitionModel) => {
  return VariableDefinitionSchema.findById(model._id).exec()
    .then(variable => {
      model.sources.forEach(source => {
        if (source.isNew) {
          variable.sources = variable.sources.concat([source]);
        } else {
          let child = variable.sources.id(source._id); //todo: resolve this typing issue
          _.assignWith(child, source, (objVal, srcVal, key) => {
            if (key === "_id") {
              return objVal;
            }
          });
        }
      });
      return variable.save();
    }).then(() => VariableDefinitionSchema.findById(model._id).exec())
});