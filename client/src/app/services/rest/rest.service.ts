import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RestService {

	apiRoot: String;
	results: Object[];
	loading: boolean;


	constructor(private http: HttpClient) {
		this.results = [];
		this.loading = false;
		this.apiRoot = 'http://localhost:3001'
	}

	get(url) {
		return this.http.get(`${this.apiRoot}/${url}`);
	}

}
