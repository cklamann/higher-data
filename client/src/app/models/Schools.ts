import { Injectable } from '@angular/core';
import { intSchoolSchema } from '../../../server/src/schemas/SchoolSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

//pattern here is public class w/ DI and therefore 'fake' static methods,
//since can't inject into a static class
//model class with instance methods on it, should be private but need typings exposed...
//of course, could always just not use class software

@Injectable()
export class Schools {
	constructor(private rest: RestService) { }

	fetch(id: number): Observable<intSchoolSchema[]> {
		return this.rest.get(`schools/${id}`);
	}

	search(name: string): Observable<School[]> {
		return this.rest.get(`schools/search?name=${name}`).map(res => {
			return res.map(school => {
				return new School(school);
			});
		});
	}

}

export class School {
	private instnm: string;
	constructor(obj: intSchoolSchema) {
		Object.assign(this, obj);
	}

	public getName(): string {
		return this.instnm;
	}
}