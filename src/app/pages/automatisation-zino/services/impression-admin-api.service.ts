import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { url_path } from 'src/app/core-custom/constants/app.constant';
import { ApiRequestService } from 'src/app/core-custom/services/api-request.service';

export interface ImpressionAgentRequest {
  agentId: string;
  codeEtablissement: string;
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
    const params: any = {
      code: query.code || undefined,
      statut: query.statut || undefined,
      page: query.page ?? 0,
      size: query.size ?? 20,
    };

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
}
