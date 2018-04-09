import { Injectable } from '@angular/core';
import { intUserModel } from '../../../server/src/schemas/UserSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable } from 'rxjs';
import { intMajorModel } from '../../../server/src/schemas/MajorSchema';
import 'rxjs/add/observable/throw';


@Injectable()
export class Majors {
	constructor(private rest: RestService) { }

	public get awardLevel(){
		return ''; //hmmm not sure if this is the place to do this -- would need to new it up, right?
		 		   // yeah, we'd fetch via the school, then transform on fetch, 
	} 
}