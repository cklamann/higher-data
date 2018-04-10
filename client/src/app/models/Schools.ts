import { Injectable } from '@angular/core';
import { intSchoolModel, intSchoolVarExport, intVariableAggQueryConfig, intVariableQueryConfig } from '../../../server/src/schemas/SchoolSchema';
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

	aggregateQuery(params: intVariableAggQueryConfig): Observable<intSchoolVarExport> {
		return this.rest.post(`schools/aggregateQuery`, params).map(res => {
			res.data.forEach(school => school = new School(school));
			return res;
		});
	}

	fetchWithVariables(params: intVariableQueryConfig): Observable<intSchoolVarExport> {
		return this.rest.post(`schools/fetchWithVariables`, params).map(res => {
			res.data = res.data.map(school => new School(school));
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