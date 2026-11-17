import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { url_path } from 'src/app/core-custom/constants/app.constant';
import { ApiRequestService } from 'src/app/core-custom/services/api-request.service';

export interface ImpressionAgentRequest {
  agentId: string;
  codeEtablissement: string;
}

export interface FactureA4Etat {
  actif: boolean;
  ticketThermique: boolean;
}

export interface ImpressionJobQuery {
  code?: string;
  statut?: 'PENDING' | 'DISPATCHED' | 'PRINTED' | 'FAILED';
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImpressionAdminApiService {

  constructor(private apiRequestService: ApiRequestService) { }

  getJobs(query: ImpressionJobQuery = {}): Observable<any> {
    // Seuls les filtres renseignes sont envoyes : un parametre "undefined" serait transmis tel quel
    // sous forme de texte ("code=undefined") et ferait filtrer le backend sur une valeur inexistante.
    const params: any = {
      page: query.page ?? 0,
      size: query.size ?? 20,
    };
    if (query.code && query.code.trim()) {
      params.code = query.code.trim();
    }
    if (query.statut) {
      params.statut = query.statut;
    }

    return this.apiRequestService.getByPage({
      endpoint: url_path.IMPRESSION_JOBS_EP,
      paginationData: params
    });
  }

  retryJob(jobId: string): Observable<any> {
    return this.apiRequestService.post({
      endpoint: `${url_path.IMPRESSION_JOBS_EP}/${jobId}/retry`,
      data: JSON.stringify({})
    });
  }

  getAgents(): Observable<any> {
    return this.apiRequestService.getAll(url_path.IMPRESSION_AGENTS_EP);
  }

  createAgent(request: ImpressionAgentRequest): Observable<any> {
    return this.apiRequestService.post({
      endpoint: url_path.IMPRESSION_AGENTS_EP,
      data: JSON.stringify(request)
    });
  }

  updateAgent(agentId: string, request: ImpressionAgentRequest): Observable<any> {
    return this.apiRequestService.put({
      endpoint: `${url_path.IMPRESSION_AGENTS_EP}/${encodeURIComponent(agentId)}`,
      data: JSON.stringify(request)
    });
  }

  deleteAgent(agentId: string): Observable<void> {
    return this.apiRequestService.delete(`${url_path.IMPRESSION_AGENTS_EP}/${encodeURIComponent(agentId)}`);
  }

  rotateAgentKey(agentId: string): Observable<any> {
    return this.apiRequestService.post({
      endpoint: `${url_path.IMPRESSION_AGENTS_EP}/${agentId}/rotate-key`,
      data: JSON.stringify({})
    });
  }

  revokeAgent(agentId: string): Observable<any> {
    return this.apiRequestService.post({
      endpoint: `${url_path.IMPRESSION_AGENTS_EP}/${agentId}/revoke`,
      data: JSON.stringify({})
    });
  }

  /** Regle la facture A4 d'un poste (agent) et le maintien du ticket 80 mm. Les champs absents ne changent pas. */
  setAgentFactureA4(agentId: string, etat: Partial<FactureA4Etat>): Observable<any> {
    return this.apiRequestService.put({
      endpoint: `${url_path.IMPRESSION_AGENTS_EP}/${encodeURIComponent(agentId)}/facture-a4`,
      data: JSON.stringify(etat)
    });
  }

  /** Met en file l'impression A4 d'une facture deja emise (reimpression possible). */
  imprimerFactureA4(numeroFacture: string, code?: string): Observable<any> {
    const suffixe = code && code.trim() ? `?code=${encodeURIComponent(code.trim())}` : '';
    return this.apiRequestService.post({
      endpoint: `${url_path.IMPRESSION_FACTURES_EP}/${encodeURIComponent(numeroFacture.trim())}/a4${suffixe}`,
      data: JSON.stringify({})
    });
  }
}
