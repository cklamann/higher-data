import { model, Schema, Document, Model } from 'mongoose';

export interface intCategoryModel {
	categories: string[];
	type:string;
};

export interface intCategorySchema extends intCategoryModel, Document { };

let schema: Schema = new Schema({
	type: {
		required:true,
		type: String
	},
	categories: {
		type: Array,
		required: true,
		unique: true
	}
});

export let CategorySchema = model<intCategorySchema>('categories', schema, 'categories');