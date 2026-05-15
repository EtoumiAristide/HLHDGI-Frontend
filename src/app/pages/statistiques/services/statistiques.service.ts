import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { url_path } from 'src/app/core-custom/constants/app.constant';
import { ApiRequestService } from 'src/app/core-custom/services/api-request.service';

export interface TimbreFacture {
  total: number;
  bkName: string;
  jourCa: string;
  montantTimbre: number;
  nfacture: string;
  mois: string;
  moyenDePaiement: string;
  nbreTicket5000: number;
}

export interface TimbresResponse {
  data: TimbreFacture[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
  message: string;
  status: boolean;
}

export interface TimbresTotauxResponse {
  data: {
    [mois: string]: {
      [pointDeVente: string]: {
        [moyenDePaiement: string]: {
          moyenDePaiement: string;
          mois: string;
          pointDeVente: string;
          totalTickets: number;
          totalMontant: number;
          nombreFactures: number;
        };
      };
    };
  };
  message: string;
  status: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StatistiquesService {

  constructor(private apiRequestService: ApiRequestService) { }

  getTimbres(data: any, paginationData: any): Observable<TimbresResponse> {
    return this.apiRequestService.postPaginate({ endpoint: url_path.STATS_TIMBRE_EP, data: JSON.stringify(data), paginationData: paginationData });
  }

  getTotauxTimbres(data: any): Observable<TimbresTotauxResponse> {
    return this.apiRequestService.post({ endpoint: url_path.STATS_TIMBRE_TOTAL_EP, data: JSON.stringify(data) });
  }

  exportTimbres(data: any): Observable<Blob> {
    return this.apiRequestService.postForBlob({ endpoint: url_path.STATS_EXPORT_TIMBRE_EP, data: JSON.stringify(data) });
  }
}
