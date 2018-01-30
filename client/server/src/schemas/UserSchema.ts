import { model, Schema, Document, Model } from 'mongoose';

export interface intUserModel {
	username: string,
	password: string,
	isAdmin: boolean,
	verifyPassword: any,
};

export interface intUserSchema extends intUserModel, Document { };

let schema: Schema = new Schema({
	username: String,
	password: String,
	isAdmin: Boolean
});

export let UserSchema = model<intUserSchema>('user', schema);