import { Injectable } from '@angular/core';
import { intSchoolModel } from '../../../server/src/schemas/SchoolSchema';
import { intVarExport } from '../../../server/src/schemas/SchoolDataSchema';
import { intQueryConfig } from '../../../server/src/types/types';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
import { sectors } from '../services/data/sectors';
import 'rxjs/add/operator/map';

@Injectable()
export class Schools {
	constructor(private rest: RestService) { }

	fetch(id: string): Observable<intSchoolModel> {
		return this.rest.get(`schools/${id}`);
	}

	search(name: string): Observable<School[]> {
		return this.rest.get(`schools/search?name=${name}`).map(res => {
			return res.map(school => {
				return new School(school);
			});
		});
	}

	fetchAggregate(params: intQueryConfig): Observable<intVarExport> {
		return this.rest.post(`schools/aggregateQuery`, params).map(res => {
			res.data = res.data.map(school => {
				if(school.instnm) return new School(school)
				return school;
			});
			return res;
		});
	}
}

export class School {
	private instnm?: string;
	private sector?: string;
	constructor(obj: intSchoolModel) {
		Object.assign(this, obj);
	}

	//for table display
	public get Name(){
		return this.instnm;
	}

	//todo: can
	public getName(): string {
		return this.instnm;
	}
}