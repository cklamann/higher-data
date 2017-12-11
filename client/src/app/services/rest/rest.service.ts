import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';


@Injectable()
export class RestService {

	apiRoot: string;
	dummyRoot: string;

	constructor(private http: HttpClient) { //injectables defined in constructor on non-components (?)
		this.apiRoot = environment.apiRoot;
	}

	get(url:string): Observable<any> { return this.http.get(`${this.apiRoot}/${url}`);}
}
