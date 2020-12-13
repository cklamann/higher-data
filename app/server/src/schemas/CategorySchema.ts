import { model, Schema, Document } from 'mongoose';

export interface CategoryModel {
	categories: string[];
	type:string;
};

export interface CategorySchema extends CategoryModel, Document { };

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

export let CategorySchema = model<CategorySchema>('categories', schema, 'categories');