import { Injectable } from '@angular/core';
import { intUserModel } from '../../../server/src/schemas/UserSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
import { intSiteContentSchema } from '../../../server/src/schemas/SiteContentSchema';



@Injectable()
export class SiteContent {
	constructor(private rest: RestService) { }

	fetchAll(): Observable<intSiteContentSchema[]> {
		return this.rest.get(`site-content/`);
	}

	fetchByHandle(handle: string): Observable<intSiteContentSchema> {
		return this.rest.get(`site-content/${handle}`);
	}

	createOrUpdate(model: intSiteContentSchema): Observable<intSiteContentSchema> {
		return this.rest.post(`site-content`, model);
	}

	delete(_id: string): Observable<any> {
		return this.rest.delete(`site-content/${_id}`);
	}
}