import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";
import { ApiPaginatedResponse } from "src/app/shared/model/api-response.model";
import { Etablissement } from "../models/etablissement.model";

@Injectable({
  providedIn: 'root'
})
export class EtablissementService {
  constructor(private _crudService: ApiRequestService) {
  }

  getAll() {
    return this._crudService.getAll(url_path.ETABLISSEMENT_EP)
  }

  sortByEntreprise() {
    return this._crudService.getAll(url_path.ETABLISSEMENT_EP + '/sortbyEntreprise')
  }

  getAllByEntreprise() {
    return this._crudService.getAll(url_path.ETABLISSEMENT_EP + '/byEntreprise')
  }

  getAllByEntrepriseId(entrepriseId: number) {
    return this._crudService.getAll(url_path.ETABLISSEMENT_EP + '/organisation/' + entrepriseId)
  }

  getById(id: number): Observable<ApiPaginatedResponse<Etablissement>> {
    return this._crudService.getById(url_path.ETABLISSEMENT_EP + '/' + id)
  }

  // getUser(): Observable<Utilisateur> {
  //   return this._crudService.getAll(url_path.ORGANISATION_EP + '/utilisateur')
  // }

  save(organisation: any): Observable<ApiPaginatedResponse<Etablissement>> {
    return this._crudService.post({ endpoint: url_path.ETABLISSEMENT_EP, data: organisation })
  }

  update(id: number, organisation: any): Observable<ApiPaginatedResponse<Etablissement>> {
    return this._crudService.put({ endpoint: url_path.ETABLISSEMENT_EP + '/' + id, data: organisation })
  }

  delete(id: number): Observable<void> {
    return this._crudService.delete(url_path.ETABLISSEMENT_EP + '/' + id)
  }
}
