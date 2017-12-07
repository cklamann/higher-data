import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RestService {

	apiRoot: String;

	constructor(private http: HttpClient) {
		this.apiRoot = 'http://localhost:3001'
	}

	get(url) { return this.http.get(`${this.apiRoot}/${url}`);}

}
