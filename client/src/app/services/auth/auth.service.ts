import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/Users';
import { RestService } from '../rest/rest.service';

@Injectable()
export class AuthService {
	user: User;
	constructor(private rest: RestService) {

	}

	login(username: string, password: string): Observable<void> {
		return this.rest.post(`users/login`, { username: username, password: password })
			.map(res => {
				if (res.password) {
					localStorage.setItem("token", res.password)
					this.user = new User(res);
				} else {
					res.throw;
				}
			});
	}

	isAdmin() {
		return this.user && this.user.isAdmin;
	}
}