import { model, Schema, Document } from "mongoose";

export interface SiteContentModel {
  handle: string;
  content: string;
  created: Date;
  updated: Date;
}

export interface SiteContentSchema extends SiteContentModel, Document {}

let schema: Schema = new Schema(
  {
    handle: {
      required: true,
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    created: {
      type: Date,
      required: true,
    },
    updated: {
      type: Date,
      required: true,
    },
  },
  { versionKey: false }
);

export let SiteContentSchema = model<SiteContentSchema>(
  "site_content",
  schema,
  "site_content"
);

SiteContentSchema.schema.statics = {
  fetchAndUpdate: (model: SiteContentSchema): Promise<SiteContentSchema> => {
    const schema = new SiteContentSchema(model);
    return schema.validate().then(() =>
      SiteContentSchema.findByIdAndUpdate(model._id, model, {
        new: true,
      }).exec()
    );
    //.catch(err => err);  //todo: catch error and send back useful response
  },
};
