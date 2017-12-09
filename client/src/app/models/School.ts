import { Injectable } from '@angular/core';
import { intSchoolModel } from '../../../server/src/models/School';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

//pattern here is public class w/ DI and therefore fake static methods,
//since can't inject into a static class
//model class with instance methods on it, should be private but need typings exposed...

@Injectable()
export class School {

	constructor(private rest: RestService) { }

	fetch(id: number): Observable<intSchoolModel[]> {
		return this.rest.get(`schools/${id}`);
	}

	search(name: string): Observable<SchoolModel[]> {
		return this.rest.get(`schools/search?name=${name}`).map(res => {
			return res.map(school => {
				return new SchoolModel(school);
			});
		});
	}

}

export class SchoolModel {
	instnm: string; //note that we need only type the public methods
	constructor(obj: intSchoolModel) {
		Object.assign(this, obj);
	}

	public getName(): string {
		return this.instnm;
	}
}