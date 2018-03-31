import { Injectable } from '@angular/core';
import { intUserModel } from '../../../server/src/schemas/UserSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
import {intCategoryModel} from '../../../server/src/schemas/CategorySchema';
import 'rxjs/add/observable/throw';


@Injectable()
export class Categories {
	constructor(private rest: RestService) { }

	fetch(name:string): Observable<intCategoryModel> {
		return this.rest.get(`categories/${name}`);
	}
}