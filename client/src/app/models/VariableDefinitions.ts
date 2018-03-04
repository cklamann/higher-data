import { Injectable } from '@angular/core';
import { intVariableDefinitionModel, intVariableSourceModel, intVariableDefinitionSchema } from '../../../server/src/schemas/VariableDefinitionSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/throw';


@Injectable()
export class VariableDefinitions {
	constructor(private rest: RestService) { }

	fetchNames(): Observable<string[]> {
		return this.rest.get(`variables/fetch_names`);
	}

	fetchByName(name: string): Observable<intVariableDefinitionSchema[]> {
		return this.rest.get(`variables/fetch_by_name?name=${name}`);
	}

	fetchAll(defined:boolean): Observable<intVariableDefinitionModel[]> {
		let query = defined ? "?defined=true" : "";
		return this.rest.get('variables' + query);
	}

	save(model: intVariableDefinitionModel): any {
		return this.rest.post(`variables`, model);
	}
}

export class VariableDefinition implements intVariableDefinitionModel {
	variable: string;
	type: string;
	sources: Array<intVariableSourceModel>;
	constructor(obj: intVariableDefinitionModel) {
		this.variable = obj.variable;
		this.type = obj.type;
		this.sources = obj.sources;
	}
}