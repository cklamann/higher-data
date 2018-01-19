import _ = require('lodash');
import { Document } from 'mongoose';

export function updateArray(arrayToUpdate: Array<any>, sourceArray: Array<any>): Array<any> {
	sourceArray.forEach(source => {
		if (source.isNew) {
			arrayToUpdate = arrayToUpdate.concat([source]); //workaround until mongoose removes $pushall
		} else {
			let child = arrayToUpdate.id(source._id);
			_.assignWith(child, source, (objVal, srcVal, key) => {
				if (key === "_id") {
					return objVal;
				}
			});
		}
	});
	return arrayToUpdate;
} 