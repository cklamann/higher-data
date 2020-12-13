
import {map} from 'rxjs/operators';
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
		return this.rest.post(`users/login`, { username: username, password: password }).pipe(
			map(res => {
				if (res.password) {
					localStorage.setItem("tihe_token", btoa(`${res.username}:${res.password}`));
					this.user = new User(res);
				} else {
					res.throw();
				}
			}));
	}

	public authorize(): Promise<boolean> {
		return this.rest.get(`users/cred`).toPromise();
	}

	public isLoggedIn() {
		return !!this.user;
	}

	public isAdmin() {
		return this.user && this.user.isAdmin;
	}
}