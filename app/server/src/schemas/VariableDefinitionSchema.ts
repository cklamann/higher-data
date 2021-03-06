import { model, Schema, Document } from "mongoose";
import { SchoolDataSchema } from "./SchoolDataSchema";

export interface VariableDefinitionModel {
  variable: string;
  valueType: string;
  friendlyName: string;
  category: string;
  sources: Array<VariableSourceModel>;
}

export interface VariableDefinitionSchema
  extends VariableDefinitionModel,
    Document {
  _id: Schema.Types.ObjectId;
  sources: VariableSourceSchema[];
}

export interface VariableSourceModel {
  startYear: string;
  endYear: string;
  source: string;
  table: string;
  formula: string;
  definition: string;
  notes: string;
}

export interface VariableSourceSchema extends VariableSourceModel, Document {}

const sourcesSchema = new Schema(
  {
    startYear: String,
    endYear: String,
    source: String,
    table: String,
    formula: String,
    definition: String,
    notes: String,
  },
  { _id: false }
);

const schema: Schema = new Schema({
  valueType: String,
  category: String,
  friendlyName: {
    type: String,
    unique: true,
  },
  variable: {
    type: String,
    unique: true,
  },
  sources: [sourcesSchema],
});

schema.path("variable").validate({
  isAsync: true,
  validator: function (value: any, respond: any) {
    SchoolDataSchema.findOne({ variable: value })
      .then((res) => {
        if (!res) respond(false);
        else respond(true);
      })
      .catch((err) => respond(err));
  },
  message: "Variable is not on any model!",
});

export let variableSourcesSchema = model<VariableSourceSchema>(
  "variable_source",
  sourcesSchema
);
export let VariableDefinitionSchema = model<VariableDefinitionSchema>(
  "variable_definition",
  schema
);

VariableDefinitionSchema.schema.statics = {
  fetchAndUpdate: (
    model: VariableDefinitionSchema
  ): Promise<VariableDefinitionSchema> => {
    const schema = new VariableDefinitionSchema(model);
    return schema.validate().then(() =>
      VariableDefinitionSchema.findByIdAndUpdate(model._id, model, {
        new: true,
      }).exec()
    );
    //.catch(err => err);  //todo: catch error and send back useful response
  },
};
