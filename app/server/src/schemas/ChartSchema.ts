import { model, Schema, Document } from "mongoose";
import { FormulaParser } from "../modules/FormulaParser";
import * as _ from "lodash";

export interface ChartVariableModel {
  formula: string;
  notes: string;
  legendName: string;
}

export interface CutByModel {
  name: string;
  formula: string;
}

export interface ChartModel {
  name: string;
  slug: string;
  type: string;
  category: string;
  active: boolean;
  valueType: string;
  description: string;
  variables: ChartVariableModel[];
  cuts: CutByModel[];
}

export interface ChartVariableSchema extends Document, ChartVariableModel {}
export interface ChartSchema extends Document, ChartModel {
  _id: Schema.Types.ObjectId;
  variables: ChartVariableSchema[];
  cuts: CutByModel[];
}

const chartVariableSchema: Schema = new Schema(
  {
    formula: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    legendName: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const cutBySchema: Schema = new Schema(
  {
    formula: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
  },
  { _id: false }
);

const schema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  valueType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  variables: {
    type: [chartVariableSchema],
    required: true,
  },
  cuts: [cutBySchema],
});

chartVariableSchema.path("formula").validate({
  isAsync: true,
  validator: function (value: any, respond: any) {
    let formula = new FormulaParser(value);
    formula
      .validate()
      .then((res) => {
        respond(res);
      })
      .catch((err) => respond(err));
  },
  message: `Variable formula is invalid!`,
});

cutBySchema.path("formula").validate({
  isAsync: true,
  validator: function (value: any, respond: any) {
    if (!value || _.isEmpty(value)) return true;
    let formula = new FormulaParser(value);
    formula
      .validate()
      .then((res) => {
        respond(res);
      })
      .catch((err) => respond(err));
  },
  message: `Cut By formula is invalid!`,
});

export let ChartSchema = model<ChartSchema>("chart", schema);
export let ChartVariableSchema = model<ChartVariableSchema>(
  "chart_variable",
  chartVariableSchema
);

ChartSchema.schema.statics = {
  fetchAndUpdate: (model: ChartSchema) => {
    const newSchema = new ChartSchema(model);
    return newSchema
      .validate()
      .then(() =>
        ChartSchema.findByIdAndUpdate(model._id, model, { new: true }).exec()
      );
    // .catch(err => err); //todo: catch the error and send intelligent response
  },
};
