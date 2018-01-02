import { Injectable } from '@angular/core';
import { intUserModel } from '../../../server/src/models/User';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';

@Injectable()
export class Users {
	constructor(private rest: RestService) { }

	fetch(id: number): Observable<intUserModel[]> {
		return this.rest.get(`users/${id}`);
	}

	login(email: string, password: string): User | any {
		return this.rest.post(`users/login`, { email: email, password: password })
			.map(res => {
				//if success
				return new User(res);
				//if no 
				return res;
			});
	}

}

export class User {
	private email: string;
	constructor(obj: intUserModel) {
		Object.assign(this, obj);
	}

	public isAdmin(): boolean {
		return true;
	}
}