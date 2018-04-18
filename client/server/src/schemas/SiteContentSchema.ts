import { model, Schema, Document, Model } from 'mongoose';

export interface intSiteContentModel {
	handle: string;
	content: string;
	created: Date;
	updated: Date;
};

export interface intSiteContentSchema extends intSiteContentModel, Document { };

let schema: Schema = new Schema({
	handle: {
		required: true,
		type: String,
		unique: true
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
	}},{ versionKey: false 
});

export let SiteContentSchema = model<intSiteContentSchema>('site_content', schema, 'site_content');

SiteContentSchema.schema.statics = {
	fetchAndUpdate: (model: intSiteContentSchema): Promise<intSiteContentSchema> => {
		const schema = new SiteContentSchema(model);
		return schema.validate()
			.then(() => SiteContentSchema.findByIdAndUpdate(model._id, model, { new: true }));
		//.catch(err => err);  //todo: catch error and send back useful response
	}
}