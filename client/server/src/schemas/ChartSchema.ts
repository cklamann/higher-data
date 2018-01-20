import { model, Schema, Document, Model } from 'mongoose';
import { ChartFormula, intFormula } from '../modules/ChartFormula.module';
import * as Util from '../modules/Util.module';
import * as _ from 'lodash';

export let ObjectId = Schema.Types.ObjectId;

export interface intChartSchema extends Document {
  name: string;
  slug: string;
  type: string;
  category: string;
  active: boolean;
  valueType: string;
  description: string;
  variables: Array<intChartVariable>;
};

export interface intChartVariable extends Document {
  formula: string;
  notes: string;
  legendName: string
};

const chartVariableSchema = new Schema({
  formula: {
    type:String,
    required: true
  },
  notes: {
    type:String,
    required: true
  },
  legendName: {
    type:String,
    required: true
  }
});

const schema: Schema = new Schema({
  id: ObjectId,
  name: {
    type:String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  type: {
    type:String,
    required: true
  },
  category: {
    type:String,
    required: true
  },
  active: {
    type:Boolean,
    required: true
  },
  valueType: {
    type:String,
    required: true
  },
  description: {
    type:String,
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
export let ChartVariableSchema = model<intChartVariable>('chart_variable', schema);

ChartSchema.schema.static('update', (model:intChartSchema) => {
  return ChartSchema.findById(model._id).exec() 
    .then(chart => {
      let copy = _.cloneDeep(model);
      delete copy.variables;
      chart.update(copy);
      chart.variables = Util.updateArray(chart.variables, model.variables);
      return chart.save();
    }).then(() => ChartSchema.findById(model._id).exec());
});