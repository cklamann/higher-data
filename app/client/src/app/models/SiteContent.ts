import { Injectable } from "@angular/core";
import { RestService } from "../services/rest/rest.service";
import { Observable } from "rxjs";
import { SiteContentSchema } from "./../../../../server/src/schemas/SiteContentSchema";

@Injectable()
export class SiteContent {
  constructor(private rest: RestService) {}

  fetchAll(): Observable<SiteContentSchema[]> {
    return this.rest.get(`site-content/`);
  }

  fetchByHandle(handle: string): Observable<SiteContentSchema> {
    return this.rest.get(`site-content/${handle}`);
  }

  createOrUpdate(model: SiteContentSchema): Observable<SiteContentSchema> {
    return this.rest.post(`site-content`, model);
  }

  delete(_id: string): Observable<any> {
    return this.rest.delete(`site-content/${_id}`);
  }
}
