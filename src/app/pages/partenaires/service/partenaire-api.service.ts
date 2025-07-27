import { Injectable } from "@angular/core";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { Partenaire } from "../model/patenaire.model";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";

@Injectable({
  providedIn: 'root'
})

export class PartenaireApiServices {
  constructor(private _apiRequestService: ApiRequestService) { }

  getAll() {
    return this._apiRequestService.getAll(url_path.PARTENAIRE);
  }

  getById(id: string) {
    return this._apiRequestService.getById(url_path.PARTENAIRE + '/' + id);
  }

  save(data: Partenaire) {
    return this._apiRequestService.post({ endpoint: url_path.PARTENAIRE, data: JSON.stringify(data) })
  }

  update(id: string, data: any) {
    return this._apiRequestService.put({ endpoint: url_path.PARTENAIRE + '/' + id, data: JSON.stringify(data) })
  }

  delete(id: string) {
    return this._apiRequestService.delete(url_path.PARTENAIRE + "/" + id)
  }
}