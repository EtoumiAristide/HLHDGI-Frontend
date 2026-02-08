import { Injectable } from "@angular/core";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";
import { ApiPaginatedResponse } from "src/app/shared/model/api-response.model";
import { Observable } from "rxjs";
import { Facture } from "../../factures/model/facture.model";

@Injectable({
  providedIn: 'root'
})

export class DashboardApiServices {
  constructor(private _apiRequestService: ApiRequestService) { }

  getDashboard(data: any) {
    return this._apiRequestService.post({ endpoint: url_path.DASHBOARD_EP, data: data })
  }
}