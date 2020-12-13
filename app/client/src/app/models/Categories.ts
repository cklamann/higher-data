import { Injectable } from "@angular/core";
import { RestService } from "../services/rest/rest.service";
import { Observable } from "rxjs";
import { CategoryModel } from "../../../../server/src/schemas/CategorySchema";

@Injectable()
export class Categories {
  constructor(private rest: RestService) {}

  fetch(name: string): Observable<CategoryModel> {
    return this.rest.get(`categories/${name}`);
  }
}
