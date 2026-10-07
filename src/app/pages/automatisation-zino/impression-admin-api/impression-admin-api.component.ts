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
