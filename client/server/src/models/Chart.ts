import { model, Schema, Document, Model } from 'mongoose';
import { ChartFormula, IntFormula } from '../modules/ChartFormula.module';

export let ObjectId = Schema.Types.ObjectId;

export interface intChartModel extends Document {
  name: string;
  type: string;
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
  valueType: String,
  description: String,
  variables: [chartVariableSchema]
});

schema.path('formula').validate({
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

//path:
//
// FE passes back a unitid and a chart id
//  route loops through formulas, newing up a ChartFormula each time and fetching data and saving it under legendName
//  once all those promises resolve and the chartData is ready, create response object and send to FE
//  for now, controller is just on the route, but wait and maybe that will change
