import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiRequestService {

  constructor(private http: HttpClient) {}

  getAll(endpoint: string): Observable<any> {
    // console.log("endpoint: " + `${environment.BASE_URL_API}${endpoint}`)
    return this.http.get(`${environment.BASE_URL_API}${endpoint}`, { headers: this.httpHeader() });
  }

  getByPage(parameter: Required<{ endpoint: string, paginationData: any }>): Observable<any> {
    // console.log("endpoint: " + `${environment.BASE_URL_API}${parameter.endpoint}`)
    return this.http.get(`${environment.BASE_URL_API}${parameter.endpoint}`, { headers: this.httpHeader(), params: parameter.paginationData });
  }

  getById(endpoint: string): Observable<any> {
    // console.log("endpoint: " + `${environment.BASE_URL_API}${endpoint}`)
    return this.http.get(`${environment.BASE_URL_API}${endpoint}`, { headers: this.httpHeader() });
  }

  getFile(endpoint: string): Observable<any> {
    // console.log("endpoint: " + `${environment.BASE_URL_API}${endpoint}`)
    return this.http.get(`${environment.BASE_URL_API}${endpoint}`, { headers: this.httpHeaderForFile(), responseType: 'blob' });
  }

  post(parameter: Required<{ endpoint: string, data: any }>): Observable<any> {
    // console.log("endpoint: " + `${environment.BASE_URL_API}${parameter.endpoint}` + ", data: " + parameter.data)
    return this.http.post(`${environment.BASE_URL_API}${parameter.endpoint}`, parameter.data, { headers: this.httpHeader() });
  }
  postForFile(parameter: Required<{ endpoint: string, data: any }>): Observable<any> {
    // console.log("endpoint: " + `${environment.BASE_URL_API}${parameter.endpoint}` + ", data: " + parameter.data)
    return this.http.post(`${environment.BASE_URL_API}${parameter.endpoint}`, parameter.data, { headers: this.httpHeaderForFile() });
  }

  put(parameter: Required<{ endpoint: string, data: any }>): Observable<any> {
    // console.log("endpoint: " + `${environment.BASE_URL_API}${parameter.endpoint}` + ", data: " + parameter.data)
    return this.http.put(`${environment.BASE_URL_API}${parameter.endpoint}`, parameter.data, { headers: this.httpHeader() });
  }
  putForFile(parameter: Required<{ endpoint: string, data: any }>): Observable<any> {
    // console.log("endpoint: " + `${environment.BASE_URL_API}${parameter.endpoint}` + ", data: " + parameter.data)
    return this.http.put(`${environment.BASE_URL_API}${parameter.endpoint}`, parameter.data, { headers: this.httpHeaderForFile() });
  }

  delete(endpoint: string): Observable<void> {
    // console.log("endpoint: " + `${environment.BASE_URL_API}${endpoint}`)
    return this.http.delete<any>(`${environment.BASE_URL_API}${endpoint}`, { headers: this.httpHeader() });
  }

  httpHeader() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
      'Accept': '*/*',
    });
  }

  httpHeaderForFile() {
    return new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
      'Accept': '*/*',
    });
  }

  //Gestion de la pagination en cas de besoin
  httpParams(params: any) {
    return new HttpParams({
      fromObject: params
    })
  }
}
