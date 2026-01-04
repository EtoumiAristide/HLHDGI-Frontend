import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CrudService } from "src/app/core/services/crud.service";
import { Organisation } from "../models/organisation.model";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiPaginatedResponse } from "src/app/shared/model/api-response.model";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {
  constructor(private _crudService: ApiRequestService) {
  }

  getAll() {
    return this._crudService.getAll(url_path.ORGANISATION_EP)
  }

  getAllByPage(paginationData: any): Observable<ApiPaginatedResponse<Organisation>> {
    return this._crudService.getByPage({ endpoint: url_path.ORGANISATION_EP + '/pages', paginationData: paginationData });
  }

  getById(id: number): Observable<ApiPaginatedResponse<Organisation>> {
    return this._crudService.getById(url_path.ORGANISATION_EP + '/' + id)
  }

  // getUser(): Observable<Utilisateur> {
  //   return this._crudService.getAll(url_path.ORGANISATION_EP + '/utilisateur')
  // }

  save(organisation: any): Observable<ApiPaginatedResponse<Organisation>> {
    return this._crudService.postForFile({ endpoint: url_path.ORGANISATION_EP, data: organisation })
  }

  update(id: number, organisation: any): Observable<ApiPaginatedResponse<Organisation>> {
    return this._crudService.postForFile({ endpoint: url_path.ORGANISATION_EP + '/' + id, data: organisation })
  }

  delete(id: number): Observable<void> {
    return this._crudService.delete(url_path.ORGANISATION_EP + '/' + id)
  }
}
