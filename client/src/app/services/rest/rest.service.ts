import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';


@Injectable()
export class RestService{

	apiRoot: string;

	constructor(private http: HttpClient) {
		this.apiRoot = environment.apiRoot;
	}

	get(url: string): Observable<any> {
		return this.http.get(`${this.apiRoot}/${url}`);
	}

	post(url: string, args: object): Observable<any> {
		let params = Object.assign({}, args);
		return this.http.post(`${this.apiRoot}/${url}`,params);
	}
}