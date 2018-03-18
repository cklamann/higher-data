import { Injectable } from '@angular/core';
import { intSchoolModel, intSchoolVarExport, intVariableAggQueryConfig, intVariableQueryConfig } from '../../../server/src/schemas/SchoolSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
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
		return this.rest.post(`schools/aggregateQuery`, params);
	}

	fetchWithVariables(params: intVariableQueryConfig): Observable<intSchoolVarExport> {
		return this.rest.post(`schools/fetchWithVariables`, params);
	}

}

export class School {
	public instnm: string;
	constructor(obj: intSchoolModel) {
		Object.assign(this, obj);
	}

	public getName(): string {
		return this.instnm;
	}
}