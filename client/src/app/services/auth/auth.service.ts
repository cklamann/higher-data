import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/Users';
import { RestService } from '../rest/rest.service';

@Injectable()
export class AuthService {
	user: User;
	constructor(private rest: RestService) {

	}

	//todo: keep user logged in by adding route to verify token in localstorage,
	//and run when page is reloaded

	login(username: string, password: string): Observable<void> {
		return this.rest.post(`users/login`, { username: username, password: password })
			.map(res => {
				if (res.password) {
					localStorage.setItem("token", res.password);
					localStorage.setItem("username", res.username);
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