import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BkRule, BkTimbreReport, BkTimbreRequest } from '../model/bk-timbre.model';
import { BkTimbreApiService } from '../service/bk-timbre-api.service';

@Component({
  selector: 'app-bk-timbre',
  templateUrl: './bk-timbre.component.html',
  styleUrls: ['./bk-timbre.component.scss']
})
export class BkTimbreComponent implements OnInit {
  period = new Date().toISOString().slice(0, 7);
  report: BkTimbreReport | null = null;
  rules: BkRule | null = null;
  loading = false;
  exportLoading = false;

  constructor(
    private _bkService: BkTimbreApiService,
    private _toastService: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadRules();
  }

  private loadRules(): void {
    console.log('🔍 Loading BK rules...');
    this._bkService.getRules().subscribe({
      next: response => {
        console.log('✅ BK rules loaded:', response);
        this.rules = response?.data ?? response;
      },
      error: error => {
        console.error('❌ Error loading BK rules:', error);
        this._toastService.error('Impossible de charger les règles BK. Vérifiez la connexion au serveur.', 'Erreur');
      }
    });
  }

  calculate(): void {
    const request: BkTimbreRequest = { period: this.period };
    this.loading = true;
    this._bkService.calculateReport(request).subscribe({
      next: response => {
        this.report = response?.data?.report ?? response?.report ?? null;
        this._toastService.success('Calcul des droits de timbre effectué.', 'Succès');
      },
      error: () => {
        this._toastService.error('Erreur lors du calcul des droits de timbre.', 'Erreur');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  exportCsv(): void {
    const request: BkTimbreRequest = { period: this.period };
    this.exportLoading = true;
    this._bkService.exportCsv(request).subscribe({
      next: blob => {
        this.downloadBlob(blob, `bk-timbre-${this.period}.csv`);
        this._toastService.success('Export CSV prêt.', 'Succès');
      },
      error: () => {
        this._toastService.error('Impossible de générer l’export CSV.', 'Erreur');
      },
      complete: () => {
        this.exportLoading = false;
      }
    });
  }

  exportExcel(): void {
    const request: BkTimbreRequest = { period: this.period };
    this.exportLoading = true;
    this._bkService.exportExcel(request).subscribe({
      next: blob => {
        this.downloadBlob(blob, `bk-timbre-${this.period}.xlsx`);
        this._toastService.success('Export Excel prêt.', 'Succès');
      },
      error: () => {
        this._toastService.error('Impossible de générer l’export Excel.', 'Erreur');
      },
      complete: () => {
        this.exportLoading = false;
      }
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
