import { Injectable } from "@angular/core";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";
import { Facture } from "../model/facture.model";
import { ApiPaginatedResponse } from "src/app/shared/model/api-response.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class FacturespiServices {
  constructor(private _apiRequestService: ApiRequestService) { }

  getAll() {
    return this._apiRequestService.getAll(url_path.FACTURE);
  }

  getAllByEntreprise(paginationData: any): Observable<ApiPaginatedResponse<Facture>> {
    return this._apiRequestService.getByPage({ endpoint: url_path.FACTURE + '/byentreprise', paginationData: paginationData });
  }

  getById(id: number) {
    return this._apiRequestService.getById(url_path.FACTURE + '/' + id);
  }

  getByNumfne(numfne: string, data: any) {
    // getByNumfne(numfne: string) {
    // return this._apiRequestService.getById(url_path.FACTURE + '/bynumfne/' + numfne);
    return this._apiRequestService.postForFile({ endpoint: url_path.FACTURE + '/bynumfne/' + numfne, data: data });
  }

  save(data: any) {
    return this._apiRequestService.postForFile({ endpoint: url_path.FACTURE, data: data })
  }

  saveAvoir(data: any) {
    return this._apiRequestService.postForFile({ endpoint: url_path.FACTURE + '/avoir', data: data })
  }

  loadFromFile(data: any) {
    return this._apiRequestService.postForFile({ endpoint: url_path.FACTURE + '/upload', data: data })
  }

  partialSave(data: any) {
    return this._apiRequestService.postForFile({ endpoint: url_path.FACTURE + '/partial-save', data: data })
  }

  getSaved(id: string) {
    return this._apiRequestService.getById(url_path.FACTURE + '/' + id + '/saved');
  }

  getAllLoadedByEntreprise(paginationData: any): Observable<ApiPaginatedResponse<Facture>> {
    return this._apiRequestService.getByPage({ endpoint: url_path.FACTURE + '/loaded/byentreprise', paginationData: paginationData });
  }

  update(id: number, data: any) {
    return this._apiRequestService.putForFile({ endpoint: url_path.FACTURE + '/' + id, data: data })
  }

  delete(id: number) {
    return this._apiRequestService.delete(url_path.FACTURE + "/" + id)
  }
  deleteLoaded(id: string) {
    return this._apiRequestService.delete(url_path.FACTURE + "/" + id + '/saved')
  }
}