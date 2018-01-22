import { Injectable } from '@angular/core';
import { intUserSchema } from '../../../server/src/schemas/UserSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/throw';


@Injectable()
export class Users {
	constructor(private rest: RestService) { }

	fetch(id: number): Observable<intUserSchema[]> {
		return this.rest.get(`users/${id}`);
	}
}
//not sure we need a whole model here?
export class User {
	constructor(obj: intUserSchema) {
		Object.assign(this, obj);
	}

	public isAdmin(): boolean {
		return true;
	}
}