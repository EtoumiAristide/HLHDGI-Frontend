import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiPaginatedResponse } from 'src/app/shared/model/api-response.model';
import { StatistiquesService, TimbreFacture, TimbresResponse } from '../services/statistiques.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-timbres',
  templateUrl: './timbres.component.html',
  styleUrls: ['./timbres.component.scss']
})
export class TimbresComponent implements OnInit {
  timbresForm: FormGroup;
  timbres: TimbreFacture[] = [];
  loading = false;
  errorMessage = '';

  // Pagination properties
  currentPage = 0;
  totalPages = 0;
  totalItems = 0;
  pageSize = environment.pageSize || 10;
  pageNum = 0;
  apiResponse: ApiPaginatedResponse<TimbreFacture> = new ApiPaginatedResponse();

  constructor(
    private fb: FormBuilder,
    private statistiquesService: StatistiquesService
  ) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.timbresForm = this.fb.group({
      //numcc: ['', [Validators.required]],
      dateDebut: [this.toDateInputValue(firstDay), Validators.required],
      dateFin: [this.toDateInputValue(now), Validators.required]
    });
  }

  ngOnInit(): void {
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  rechercher(page: number = 0): void {
    if (this.timbresForm.invalid) {
      this.timbresForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.currentPage = page;

    const payload = {
      //numcc: this.timbresForm.value.numcc,
      dateDebut: this.timbresForm.value.dateDebut,
      dateFin: this.timbresForm.value.dateFin
    };

    this.statistiquesService.getTimbres(payload, { page: page, size: this.pageSize }).subscribe({
      next: (response: TimbresResponse) => {
        this.apiResponse = response as ApiPaginatedResponse<TimbreFacture>;
        this.timbres = response.data || [];
        this.totalPages = response.total_pages || 0;
        this.totalItems = response.total_items || 0;
        this.currentPage = response.current_page || 0;
        this.pageSize = response.page_size || 10;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erreur lors du chargement des données. Vérifiez votre connexion ou les paramètres.';
        console.error('Erreur API timbres:', error);
        // Reset pagination on error
        this.totalPages = 0;
        this.totalItems = 0;
        this.currentPage = 0;
        this.timbres = [];
        this.apiResponse = new ApiPaginatedResponse();
      }
    });
  }

  onSearch(): void {
    this.resetPagination();
    this.rechercher(0);
  }

  private resetPagination(): void {
    this.currentPage = 0;
    this.totalPages = 0;
    this.totalItems = 0;
    this.pageNum = 0;
    this.timbres = [];
    this.apiResponse = new ApiPaginatedResponse();
  }

  changePage(newPage: number | string): void {
    if (newPage === 'prev') {
      this.pageNum--;
      if (this.pageNum < 0) this.pageNum = 0;
    } else if (newPage === 'next') {
      this.pageNum++;
      if (this.pageNum === this.apiResponse.total_pages) {
        this.pageNum = this.apiResponse.current_page;
      }
    }

    this.rechercher(this.pageNum);
  }

  exportCsv(): void {
    if (!this.timbres.length) {
      return;
    }
    const csv = this.buildCsv();
    this.downloadFile(csv, 'timbres-factures.csv', 'text/csv;charset=utf-8;');
  }

  exportExcel(): void {
    if (!this.timbres.length) {
      return;
    }
    if (this.timbresForm.invalid) {
      this.timbresForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      dateDebut: this.timbresForm.value.dateDebut,
      dateFin: this.timbresForm.value.dateFin
    };

    this.statistiquesService.exportTimbres(payload).subscribe({
      next: (blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'timbre_factures_' + payload.dateDebut + '_' + payload.dateFin + '.xlsx';
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erreur lors de l\'export Excel. Vérifiez votre connexion ou réessayez.';
        console.error('Erreur export Excel:', error);
      }
    });
  }

  private buildCsv(): string {
    const headers = [
      'total',
      'bkName',
      'jourCa',
      'montantTimbre',
      'nfacture',
      'mois',
      'moyenDePaiement',
      'nbreTicket5000'
    ];

    const rows = this.timbres.map(item => [
      item.total,
      item.bkName,
      item.jourCa,
      item.montantTimbre,
      item.nfacture,
      item.mois,
      item.moyenDePaiement,
      item.nbreTicket5000
    ].map(value => this.escapeCsvValue(value)));

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  }

  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = value.toString();
    if (/[",\n\r]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  private downloadFile(data: string, filename: string, mimeType: string): void {
    const blob = new Blob(['\ufeff' + data], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  }
}
