import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {ApiService} from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  constructor(private api: ApiService) {
  }

  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      this.api.post("/is-admin/").subscribe(httpResponse => {
        resolve(httpResponse.body === true)
      })
    });
  }
}
