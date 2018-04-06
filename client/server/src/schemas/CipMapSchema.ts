import { model, Schema, Document, Model } from 'mongoose';

export interface intCipMapModel {
	cipcode: string;
	label: string;
};

export interface intCipMapSchema extends intCipMapModel, Document { };

let schema: Schema = new Schema({
	cipcode: {
		type: String,
		required: true,
		unique: true
	},
	label:String,
});

export let CipMapSchema = model<intCipMapSchema>('cip_map', schema, 'cip_map');
