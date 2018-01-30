import { model, Schema, Document, Model } from 'mongoose';
import { ChartFormula, intFormula } from '../modules/ChartFormula.module';
import * as Util from '../modules/Util.module';
import * as _ from 'lodash';

export interface intChartVariableModel {
  formula: string;
  notes: string;
  legendName: string;
}

export interface intChartModel {
  name: string;
  slug: string;
  type: string;
  category: string;
  active: boolean;
  valueType: string;
  description: string;
  variables: intChartVariableModel[];
}

export interface intChartVariableSchema extends Document, intChartVariableModel { };
export interface intChartSchema extends Document, intChartModel { 
  variables : intChartVariableSchema[];
};


const chartVariableSchema:Schema = new Schema({
  formula: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    required: true
  },
  legendName: {
    type: String,
    required: true
  }
});

const schema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  },
  valueType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  variables: [chartVariableSchema]
});

chartVariableSchema.path('formula').validate({
  isAsync: true,
  validator: function(value: any, respond: any) {
    let formula = new ChartFormula(value);
    formula.validate()
      .then(res => {
        respond(res);
      })
      .catch(err => respond(err));
  },
  message: 'Formula is invalid!'
});

export let ChartSchema = model<intChartSchema>('chart', schema);
export let ChartVariableSchema = model<intChartVariableSchema>('chart_variable', chartVariableSchema);

//todo: there's no reason to have this in a static,
//verify it does everything you want it to do in some more tests then just use in route
//and extend pattern to variableDefinition
ChartSchema.schema.static('update', (model: intChartSchema) => {
  return ChartSchema.update({_id:model._id},model).then(() => model);
});