import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {catchError, Observable, throwError, timeout} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  constructor(private http: HttpClient) {
  }

  baseUrl: string = "https://over4fun.com/api/v2"
  // baseUrl: string =  "http://127.0.0.1:5052/api/v2"

  private handleError = (error: HttpErrorResponse) => {
    console.log("Error connecting to the server: " + (error.statusText || error.message))
    return throwError(error)
  }

  get(endpoint: string, params?: HttpParams, timeOut?: number): Observable<any> {
    return this.http.get(this.baseUrl + endpoint, {
      withCredentials: true,
      params: params,
      responseType: "json",
      observe: "response",
    }).pipe(
      timeout(timeOut || 5000),
      catchError(this.handleError)
    )
  }

  post(endpoint: string, body?: object, timeOut?: number): Observable<any> {
    return this.http.post(this.baseUrl + endpoint, body, {
      withCredentials: true,
      responseType: "json",
      observe: "response"
    }).pipe(
      timeout(timeOut || 5000),
      catchError(this.handleError)
    )
  }
}
