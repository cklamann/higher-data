import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RestService {

	results: Object[];
	loading: boolean;


	constructor(private http: HttpClient) {
		this.results = [];
		this.loading = false;
	}

	fetch() {
		return this.http.get('http://localhost:3001/users');
	}

}
