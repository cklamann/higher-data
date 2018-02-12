import { model, Schema, Document, Model } from 'mongoose';
import { ChartFormula, intFormula } from '../modules/ChartFormula.module';
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
  _id: Schema.Types.ObjectId,
  variables: intChartVariableSchema[];
};


const chartVariableSchema: Schema = new Schema({
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
}, {_id:false});

const schema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
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
  message: `Formula is invalid!`
});

export let ChartSchema = model<intChartSchema>('chart', schema);
export let ChartVariableSchema = model<intChartVariableSchema>('chart_variable', chartVariableSchema);


ChartSchema.schema.statics = {
  fetchAndUpdate: (model: intChartSchema): Promise<intChartSchema> => {
    const newSchema = new ChartSchema(model);
    return newSchema.validate()
      .then(() => ChartSchema.findByIdAndUpdate(model._id, model, { new: true }));
      // .catch(err => err); //todo: catch the error and send intelligent response
  }
}