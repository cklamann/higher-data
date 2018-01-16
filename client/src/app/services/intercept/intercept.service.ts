import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class InterceptService implements HttpInterceptor {
	constructor() { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		let token = localStorage.getItem('token') ? localStorage.getItem('token') : ''; 
		let username = localStorage.getItem('username') ? localStorage.getItem('username') : ''; 
		const authReq = req.clone({
			headers: req.headers.set('Authorization', 'Basic ' + username + ":" + token)
		});
		return next.handle(authReq);
	}
}