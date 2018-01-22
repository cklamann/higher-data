import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/Users';
import { RestService } from '../rest/rest.service';
import { Router } from '@angular/router';

export interface intAuthService {
	login: any,
	authorize: any
}

@Injectable()
export class AuthService implements intAuthService {
	user: User;
	constructor(private rest: RestService, private router: Router) {
	}

	public login(username: string, password: string): Observable<void> {
		return this.rest.post(`users/login`, { username: username, password: password })
			.map(res => {
				if (res.password) {
					localStorage.setItem("tihe_token", res.password);
					localStorage.setItem("tihe_username", res.username);
					this.user = new User(res);
				} else {
					res.throw();
				}
			});
	}

	public authorize(): boolean {
		if (localStorage.getItem("tihe_token") && localStorage.getItem("tihe_username")) {
			return true;
		} else {
			this.router.navigate(['/login']);
			return false;
		}
	}

	public isLoggedIn() {
		return !!this.user;
	}

	public isAdmin() {
		return this.user && this.user.isAdmin;
	}
}