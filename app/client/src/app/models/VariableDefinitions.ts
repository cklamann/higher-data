import { Injectable } from "@angular/core";
import {
  VariableDefinitionModel,
  VariableSourceModel,
  VariableDefinitionSchema,
} from "../../../../server/src/schemas/VariableDefinitionSchema";
import { RestService } from "../services/rest/rest.service";
import { Observable } from "rxjs";

@Injectable()
export class VariableDefinitions {
  constructor(private rest: RestService) {}

  fetchNames(): Observable<string[]> {
    return this.rest.get(`variables/fetch_names`);
  }

  fetchByName(name: string): Observable<VariableDefinitionSchema[]> {
    return this.rest.get(`variables/fetch_by_name?name=${name}`);
  }

  fetchAll(defined: boolean): Observable<VariableDefinitionModel[]> {
    let query = defined ? "?defined=true" : "";
    return this.rest.get("variables" + query);
  }

  save(model: VariableDefinitionModel): any {
    return this.rest.post(`variables`, model);
  }
}

export class VariableDefinition implements VariableDefinitionModel {
  variable: string;
  valueType: string;
  category: string;
  friendlyName: string;
  sources: Array<VariableSourceModel>;
  structor(obj: VariableDefinitionModel) {
    this.variable = obj.variable;
    this.valueType = obj.valueType;
    this.sources = obj.sources;
    this.category = obj.category;
    this.friendlyName = obj.friendlyName;
  }
}
