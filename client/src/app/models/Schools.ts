import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { intSchoolModel } from '../../../server/src/schemas/SchoolSchema';
import { intSchoolDataModel } from '../../../server/src/schemas/SchoolDataSchema';
import { intExportAgg } from '../../../server/src/schemas/SchoolDataSchema';
import { intSchoolDataAggQuery } from '../../../server/src/modules/SchoolDataQuery.module';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
import { sectors } from '../services/data/sectors';


@Injectable()
export class Schools {
	constructor(private rest: RestService) { }

	fetch(id: string): Observable<intSchoolModel> {
		return this.rest.get(`schools/${id}`);
	}

	search(name: string): Observable<School[]> {
		return this.rest.get(`schools?q=${name}`).pipe(map(res => {
			return res.map(school => {
				return new School(school);
			});
		}));
	}

	fetchData(qs: string): Observable<intExportAgg> {
		if (!qs.length) throw new Error("query string missing!");
		return this.rest.get(`school-data/?${qs}`).pipe(map(res => {
			res.data = res.data.map(school => {
				if (school.name) return new School(school)
				return school;
			});
			return res;
		}));
	}
}

export class School {
	private name?: string;
	private sector?: string;
	constructor(obj: intSchoolModel) {
		Object.assign(this, obj);
	}

	//for table display
	public get Name() {
		return this.name;
	}

	public getName() {
		return this.name;
	}
}