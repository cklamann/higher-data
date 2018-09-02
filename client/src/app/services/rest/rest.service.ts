import { Injectable } from '@angular/core';
import {
	HttpClient,
	HttpResponse
} from '@angular/common/http';
import { Jsonp } from '@angular/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class RestService {

	apiRoot: string;

	constructor(private http: HttpClient, private jsonp: Jsonp) {
		this.apiRoot = environment.apiRoot;
	}

	get(url: string, params: object = {}): Observable<any> {
		if(!_.isEmpty(params)){
			params = {
				params: params
			}
		}
		return this.http.get(`${this.apiRoot}/${url}`,params);
	}

	getJsonP(url: string): Observable<any> {
		return this.jsonp.get(url)
	}

	post(url: string, args: object): Observable<any> {
		let params = Object.assign({}, args);
		return this.http.post(`${this.apiRoot}/${url}`, params);
	}

	delete(url: string): Observable<any> {
		return this.http.delete(`${this.apiRoot}/${url}`);
	}
}