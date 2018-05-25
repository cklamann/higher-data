import { Injectable } from '@angular/core';
import { intChartModel, intChartSchema, intCutByModel, intChartVariableModel } from '../../../server/src/schemas/ChartSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/throw';


@Injectable()
export class Charts {
	constructor(private rest: RestService) { }

	fetch(id: number): Observable<intChartSchema> {
		return this.rest.get(`api/charts/${id}`);
	}

	fetchAll(): Observable<intChartModel[]> {
		return this.rest.get(`charts`);
	}

	save(model: intChartModel): Observable<intChartSchema> {
		return this.rest.post(`charts`, model);
	}

	delete(_id: string): Observable<any> {
		return this.rest.delete(`charts/${_id}`);
	} 
}

export class Chart implements intChartModel {
	name: string;
	slug: string;
	type: string;
	category: string;
	active: boolean;
	valueType: string;
	description: string;
	variables: intChartVariableModel[];
	cuts: intCutByModel[];
	constructor(obj: intChartModel) {
		this.name = obj.name;
		this.slug = obj.slug;
		this.type = obj.type;
		this.category = obj.category;
		this.active = obj.active;
		this.valueType = obj.valueType;
		this.description = obj.description;
		this.variables = obj.variables;
		this.cuts = obj.cuts;
	}
}