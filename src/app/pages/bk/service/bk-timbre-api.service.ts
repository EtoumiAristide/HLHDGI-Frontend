import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiRequestService } from 'src/app/core-custom/services/api-request.service';
import { url_path } from 'src/app/core-custom/constants/app.constant';
import { BkTimbreRequest } from '../model/bk-timbre.model';

@Injectable({
  providedIn: 'root'
})
export class BkTimbreApiService {

  constructor(
    private _apiRequestService: ApiRequestService,
    private _http: HttpClient
  ) { }

  getRules(): Observable<any> {
    return this._apiRequestService.getAll(url_path.BK_TIMBRE + '/rules');
  }

  getAuthorizedRoles(): Observable<any> {
    return this._apiRequestService.getAll(url_path.BK_TIMBRE + '/roles');
  }

  calculateReport(request: BkTimbreRequest): Observable<any> {
    return this._apiRequestService.post({ endpoint: url_path.BK_TIMBRE + '/calculate', data: request });
  }

  exportCsv(request: BkTimbreRequest): Observable<Blob> {
    return this._http.post(
      `${environment.BASE_URL_API}${url_path.BK_TIMBRE}/export/csv`,
      request,
      {
        headers: this._apiRequestService.httpHeaderForFile(),
        responseType: 'blob' as const
      }
    ) as Observable<Blob>;
  }

  exportExcel(request: BkTimbreRequest): Observable<Blob> {
    return this._http.post(
      `${environment.BASE_URL_API}${url_path.BK_TIMBRE}/export/excel`,
      request,
      {
        headers: this._apiRequestService.httpHeaderForFile(),
        responseType: 'blob' as const
      }
    ) as Observable<Blob>;
  }
}
