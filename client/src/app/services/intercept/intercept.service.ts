import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class InterceptService implements HttpInterceptor {
	constructor() { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		let token = localStorage.getItem('token') ? localStorage.getItem('token') : ''; 
		const authReq = req.clone({
			headers: req.headers.set('Authorization', token)
		});
		return next.handle(authReq);
	}
}