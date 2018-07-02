import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpResponse, HttpErrorResponse, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';


@Injectable()
export class InterceptService implements HttpInterceptor {
	constructor(private router: Router) { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const token = localStorage.getItem('tihe_token') ? localStorage.getItem('tihe_token') : 'no:no',
		authReq = req.clone({
			headers: req.headers.set('Authorization', `Basic ${token}`)
		});
		return next.handle(authReq)
			.map((event: HttpEvent<any>) => {
				if (event instanceof HttpResponse && event.status === 401) {
					this.router.navigate(["/login"]);
				}
				return event;
			});
	}

}