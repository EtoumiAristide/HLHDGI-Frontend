import { Component, OnInit } from '@angular/core';
import { ImpressionAdminApiService } from '../services/impression-admin-api.service';

@Component({
  selector: 'app-impression-admin-api',
  templateUrl: './impression-admin-api.component.html',
  styleUrls: ['./impression-admin-api.component.scss']
})
export class ImpressionAdminApiComponent implements OnInit {
  jobs: any[] = [];
  agents: any[] = [];
  loading = false;
  errorMessage = '';

  // Facture A4 (fonction optionnelle, reglee par agent)
  factureA4Enregistrement = false;
  factureA4Message = '';
  factureA4Erreur = false;
  numeroFactureA4 = '';
  codeEtablissementA4 = '';

  constructor(private impressionService: ImpressionAdminApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.impressionService.getJobs({ page: 0, size: 20 }).subscribe({
      next: (response) => {
        this.jobs = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement jobs impression:', error);
        this.jobs = [];
        this.loading = false;
        this.errorMessage = 'Impossible de charger les jobs impression.';
      }
    });

    this.impressionService.getAgents().subscribe({
      next: (response) => {
        this.agents = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      },
      error: (error) => {
        console.error('Erreur chargement agents impression:', error);
        this.agents = [];
      }
    });
  }

  /** Enregistre le reglage A4 d'un poste ; en cas d'echec, la liste est rechargee depuis le serveur. */
  majAgentA4(agent: any, changement: { actif?: boolean; ticketThermique?: boolean }): void {
    const id = agent?.agentId;
    if (!id) { return; }
    this.factureA4Enregistrement = true;
    this.factureA4Message = '';
    this.impressionService.setAgentFactureA4(id, changement).subscribe({
      next: (response) => {
        const maj = response?.data ?? response;
        agent.factureA4Actif = !!maj?.factureA4Actif;
        agent.ticketThermique = maj?.ticketThermique !== false;
        this.factureA4Enregistrement = false;
        this.factureA4Erreur = false;
        this.factureA4Message = agent.factureA4Actif
          ? `${id} : facture A4 activee (${agent.ticketThermique ? 'ticket 80 mm + A4' : 'A4 seul'}).`
          : `${id} : facture A4 desactivee (ticket 80 mm uniquement).`;
      },
      error: (error) => {
        console.error('Erreur mise a jour facture A4:', error);
        this.factureA4Enregistrement = false;
        this.factureA4Erreur = true;
        this.factureA4Message = 'Modification impossible (droits administrateur requis ?).';
        this.loadData();
      }
    });
  }

  basculerA4(agent: any): void {
    this.majAgentA4(agent, { actif: !agent.factureA4Actif });
  }

  basculerTicketThermique(agent: any): void {
    this.majAgentA4(agent, { ticketThermique: !(agent.ticketThermique !== false) });
  }

  imprimerA4(): void {
    const numero = this.numeroFactureA4.trim();
    if (!numero) { return; }
    this.factureA4Message = '';
    this.impressionService.imprimerFactureA4(numero, this.codeEtablissementA4).subscribe({
      next: () => {
        this.factureA4Erreur = false;
        this.factureA4Message = `Impression A4 de la facture ${numero} mise en file.`;
        this.loadData();
      },
      error: (error) => {
        console.error('Erreur impression A4 a la demande:', error);
        this.factureA4Erreur = true;
        this.factureA4Message = error?.error?.message || error?.error?.error || `Impression A4 impossible pour ${numero}.`;
      }
    });
  }

  retryJob(jobId: string): void {
    if (!jobId) { return; }

    this.impressionService.retryJob(jobId).subscribe({
      next: () => this.loadData(),
      error: (error) => console.error('Erreur relance job impression:', error)
    });
  }

  statusClass(statut: string): string {
    switch (statut) {
      case 'PENDING': return 'badge bg-warning text-dark';
      case 'DISPATCHED': return 'badge bg-info text-dark';
      case 'PRINTED': return 'badge bg-success';
      case 'FAILED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
