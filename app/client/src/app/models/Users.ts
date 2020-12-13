import { Injectable } from "@angular/core";
import { UserModel } from "./../../../../server/src/schemas/UserSchema";
import { RestService } from "../services/rest/rest.service";
import { Observable } from "rxjs";

@Injectable()
export class Users {
  constructor(private rest: RestService) {}

  fetch(id: number): Observable<UserModel[]> {
    return this.rest.get(`users/${id}`);
  }
}
//not sure we need a whole model here?
export class User {
  constructor(obj: UserModel) {
    Object.assign(this, obj);
  }

  public isAdmin(): boolean {
    return true;
  }
}
