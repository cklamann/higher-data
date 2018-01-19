import { model, Schema, Document, Model } from 'mongoose';
import { ChartFormula, IntFormula } from '../modules/ChartFormula.module';
import * as Util from '../modules/Util.module';
import * as _ from 'lodash';

export let ObjectId = Schema.Types.ObjectId;

export interface intChartModel extends Document {
  name: string;
  type: string;
  category: string;
  active: boolean;
  valueType: string;
  description: string;
  variables: Array<intChartVariable>;
};

export interface intChartVariable extends Document {
  formula: IntFormula;
  notes: string;
  legendName: string
};

const chartVariableSchema = new Schema({
  formula: String,
  notes: String,
  legendName: String,
});

const schema: Schema = new Schema({
  id: ObjectId,
  name: String,
  type: String,
  category: String,
  active: Boolean,
  valueType: String,
  description: String,
  variables: [chartVariableSchema]
});

chartVariableSchema.path('formula').validate({
  isAsync: true,
  validator: function(value: any, respond: any) {
    let formula = new ChartFormula(value);
    formula.validate()
      .then(res => respond(true))
      .catch(res => respond(false));
  },
  message: 'Formula is invalid!'
});

export let ChartSchema = model<intChartModel>('chartModel', schema);
export let ChartVariableSchema = model<intChartVariable>('chartVariableModel', schema);

//todo: write tests for this method
ChartSchema.schema.static('update', (model: intChartModel) => {
  return ChartSchema.findById(model._id).exec()
    .then(chart => {
      _.assignWith(chart, model, (objVal, srcVal, key) => {
        if (key === "_id" || key === "variables") {
          return objVal;
        }
      });
      chart.variables = Util.updateArray(chart.variables, model.variables);
      return chart.save();
    }).then(() => ChartSchema.findById(model._id).exec())
});
