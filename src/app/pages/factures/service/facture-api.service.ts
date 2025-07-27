import { Injectable } from "@angular/core";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";
import { Facture } from "../model/facture.model";

@Injectable({
  providedIn: 'root'
})

export class FacturespiServices {
  constructor(private _apiRequestService: ApiRequestService) { }

  getAll() {
    return this._apiRequestService.getAll(url_path.FACTURE);
  }

  getById(id: number) {
    return this._apiRequestService.getById(url_path.FACTURE + '/' + id);
  }

  save(data: any) {
    return this._apiRequestService.postForFile({ endpoint: url_path.FACTURE, data: data })
  }

  loadFromFile(data: any) {
    return this._apiRequestService.postForFile({ endpoint: url_path.FACTURE + '/upload', data: data })
  }

  update(id: number, data: any) {
    return this._apiRequestService.putForFile({ endpoint: url_path.FACTURE + '/' + id, data: data })
  }

  delete(id: number) {
    return this._apiRequestService.delete(url_path.FACTURE + "/" + id)
  }
}