import { model, Schema, Document, Model } from 'mongoose';
import { Formula } from '../modules/Formula.module';

export let ObjectId = Schema.Types.ObjectId;

export interface intChartModel extends Document {
  name: string;
  type: string;
  valueType: string;
  description: string;
  variables: Array<intChartVariable>;
};

export interface intChartVariable extends Document {
  formula: Formula;
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

//todo: validate formula....

export let ChartSchema = model<intChartModel>('chartModel', schema);

//need a static fetch method that will return a model with a unitid bound to it
//unitid is an instance property, must be there


//idea is that front end passes back model, 
//be makes new model, then validates all formulae
//need an endpoint that will validate formulae on the fly, so we can hit it
//while we build