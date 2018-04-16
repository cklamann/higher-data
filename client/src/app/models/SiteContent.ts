import { Injectable } from '@angular/core';
import { intUserModel } from '../../../server/src/schemas/UserSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
import { intSiteContentSchema } from '../../../server/src/schemas/SiteContentSchema';
import 'rxjs/add/observable/throw';


@Injectable()
export class SiteContent {
	constructor(private rest: RestService) { }

	fetchAll(): Observable<intSiteContentSchema[]> {
		return this.rest.get(`site-content/`);
	}

	create(model: intSiteContentSchema): Observable<intSiteContentSchema> {
		return this.rest.post(`site-content`, model);
	}
}