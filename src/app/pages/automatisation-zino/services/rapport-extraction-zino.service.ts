import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { url_path } from 'src/app/core-custom/constants/app.constant';
import { ApiRequestService } from 'src/app/core-custom/services/api-request.service';

export interface RapportFichierDto {
  id: number;
  nomFichier: string;
  statut: string;
  dateCreation: string;
  dateDerniereModification: string;
  tentativeEnvoi: number;
  dernierMessageErreur: string;
  nombreTickets: number;
  nombreFacturesEnvoyees: number;
}

export interface RapportFactureDto {
  numFacture: string;
  referenceFNE: string;
  lienFacture: string;
  dateFacture: string;
  nomClient: string;
  modePaiement: string;
  montant: number;
  statutFNE: string;
  nomFichierSource: string;
}

export interface RapportExtractionTotaux {
  nombreFichiers: number;
  nombreFichiersSucces: number;
  nombreFichiersErreur: number;
  nombreFichiersEnAttente: number;
  nombreTicketsExtraits: number;
  nombreFacturesEnvoyees: number;
}

export interface RapportExtractionResponse {
  dateDebut: string;
  dateFin: string;
  fichiers: RapportFichierDto[];
  totaux: RapportExtractionTotaux;
}

export interface RapportFacturesPageResponse {
  data: RapportFactureDto[];
  total_pages: number;
  total_items: number;
  current_page: number;
  page_size: number;
  message: string;
  status: boolean;
}

export interface RapportExtractionRequest {
  dateDebut: string;
  dateFin: string;
  statut?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class RapportExtractionZinoService {

  constructor(private apiRequestService: ApiRequestService) { }

  getRapport(request: RapportExtractionRequest): Observable<{ data: RapportExtractionResponse; message: string; status: boolean }> {
    return this.apiRequestService.post({ endpoint: url_path.RAPPORT_EXTRACTION_ZINO_EP, data: JSON.stringify(request) });
  }

  getFacturesPaginees(
    request: RapportExtractionRequest,
    page: number,
    size: number,
    sortBy: string = 'dateCreation',
    direction: string = 'DESC'
  ): Observable<RapportFacturesPageResponse> {
    return this.apiRequestService.postPaginate({
      endpoint: url_path.RAPPORT_EXTRACTION_ZINO_EP + '/factures',
      data: JSON.stringify(request),
      paginationData: { page, size, sortBy, direction }
    });
  }

  exportExcel(request: RapportExtractionRequest): Observable<Blob> {
    return this.apiRequestService.postForBlob({ endpoint: url_path.RAPPORT_EXTRACTION_ZINO_EXPORT_EXCEL_EP, data: JSON.stringify(request) });
  }

  exportPdf(request: RapportExtractionRequest): Observable<Blob> {
    return this.apiRequestService.postForBlob({ endpoint: url_path.RAPPORT_EXTRACTION_ZINO_EXPORT_PDF_EP, data: JSON.stringify(request) });
  }

  exportWord(request: RapportExtractionRequest): Observable<Blob> {
    return this.apiRequestService.postForBlob({ endpoint: url_path.RAPPORT_EXTRACTION_ZINO_EXPORT_WORD_EP, data: JSON.stringify(request) });
  }

  envoyerParMail(request: RapportExtractionRequest, destinataire: string, format: 'excel' | 'pdf' | 'word'): Observable<any> {
    return this.apiRequestService.post({
      endpoint: url_path.RAPPORT_EXTRACTION_ZINO_ENVOYER_MAIL_EP,
      data: JSON.stringify({ request, destinataire, format })
    });
  }
}
