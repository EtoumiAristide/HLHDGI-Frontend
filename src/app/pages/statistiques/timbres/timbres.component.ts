import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiPaginatedResponse } from 'src/app/shared/model/api-response.model';
import { StatistiquesService, TimbreFacture, TimbresResponse, TimbresTotauxResponse } from '../services/statistiques.service';
import { environment } from 'src/environments/environment';
import { PointVenteService } from '../../admin/pointvente/services/pointvente.service';
import { PointVente } from '../../admin/pointvente/models/pointvente.model';

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

  listePointVente: any[] = [];
  showTimbresTotaux = false;
  timbresTotaux: Array<{
    moyenDePaiement: string;
    mois: string;
    moisFormate: string;
    pointDeVente: string;
    totalTickets: number;
    totalMontant: number;
    nombreFactures: number;
    rowSpanMois?: number;
    rowSpanPointDeVente?: number;
    showMoisCell?: boolean;
    showPointDeVenteCell?: boolean;
  }> = [];

  constructor(
    private fb: FormBuilder,
    private statistiquesService: StatistiquesService,
    private _pointVenteApi: PointVenteService,
  ) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.timbresForm = this.fb.group({
      //numcc: ['', [Validators.required]],
      dateDebut: [this.toDateInputValue(firstDay), Validators.required],
      dateFin: [this.toDateInputValue(now), Validators.required],
      pointDeVente: [null]
    });
  }

  ngOnInit(): void {
    this.chargerPointVente()
  }

  private formateMoisFrancais(moisString: string): { date: Date; formate: string } {
    // Format: "01 2026" -> "Janvier 2026"
    const [mois, annee] = moisString.trim().split(' ');
    const moisNum = parseInt(mois, 10);
    const anneeNum = parseInt(annee, 10);
    
    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    const moisFormate = `${moisNoms[moisNum - 1]} ${annee}`;
    const date = new Date(anneeNum, moisNum - 1, 1);
    
    return { date, formate: moisFormate };
  }

  private transformeTotaux(data: any): any[] {
    const totals: any[] = [];
    Object.keys(data).forEach(mois => {
      const points = data[mois] || {};
      Object.keys(points).forEach((pointDeVente) => {
        const methods = points[pointDeVente] || {};
        Object.keys(methods).forEach((methode) => {
          const { date, formate } = this.formateMoisFrancais(mois);
          totals.push({
            ...methods[methode],
            mois,
            moisFormate: formate,
            pointDeVente,
            dateForSort: date
          });
        });
      });
    });

    // Trier par date
    const sortedTotals = totals.sort((a, b) => a.dateForSort.getTime() - b.dateForSort.getTime());

    const monthCounts: { [mois: string]: number } = {};
    const pointCounts: { [key: string]: number } = {};

    sortedTotals.forEach(item => {
      monthCounts[item.mois] = (monthCounts[item.mois] || 0) + 1;
      const pointKey = `${item.mois}|||${item.pointDeVente}`;
      pointCounts[pointKey] = (pointCounts[pointKey] || 0) + 1;
    });

    const seenMonths = new Set<string>();
    const seenPoints = new Set<string>();

    return sortedTotals.map(item => {
      const monthKey = item.mois;
      const pointKey = `${item.mois}|||${item.pointDeVente}`;
      const showMoisCell = !seenMonths.has(monthKey);
      const showPointCell = !seenPoints.has(pointKey);

      if (showMoisCell) {
        seenMonths.add(monthKey);
      }
      if (showPointCell) {
        seenPoints.add(pointKey);
      }

      return {
        ...item,
        rowSpanMois: showMoisCell ? monthCounts[monthKey] : 0,
        rowSpanPointDeVente: showPointCell ? pointCounts[pointKey] : 0,
        showMoisCell,
        showPointDeVenteCell: showPointCell
      };
    });
  }

  toggleRecap(): void {
    this.showTimbresTotaux = !this.showTimbresTotaux;
  }

  calculerTotaux(): { totalTickets: number; totalMontant: number; nombreFactures: number } {
    return this.timbresTotaux.reduce(
      (acc, item) => ({
        totalTickets: acc.totalTickets + (item.totalTickets || 0),
        totalMontant: acc.totalMontant + (item.totalMontant || 0),
        nombreFactures: acc.nombreFactures + (item.nombreFactures || 0)
      }),
      { totalTickets: 0, totalMontant: 0, nombreFactures: 0 }
    );
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

    const selectedPointVenteId = this.timbresForm.value.pointDeVente;
    let pointVenteName: string | null = null;
    if (selectedPointVenteId !== null && selectedPointVenteId !== undefined) {
      const found = this.listePointVente.find(p => p.id === selectedPointVenteId);
      pointVenteName = found ? found.nom : null;
    }

    const payload = {
      //numcc: this.timbresForm.value.numcc,
      dateDebut: this.timbresForm.value.dateDebut,
      dateFin: this.timbresForm.value.dateFin,
      // optional: send the point de vente name (null when "Tous" selected)
      pointDeVente: pointVenteName,
    };

    this.chargerTimbres(payload, page);
    this.chargerTotauxTimbres(payload);
  }

  private chargerTimbres(payload: any, page: number): void {
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

  private chargerTotauxTimbres(payload: any): void {
    this.statistiquesService.getTotauxTimbres(payload).subscribe({
      next: (response: TimbresTotauxResponse) => {
        this.timbresTotaux = this.transformeTotaux(response.data || {});
      },
      error: (error) => {
        console.error('Erreur API totaux timbres:', error);
      }
    });
  }

  chargerPointVente() {
    // this._pointVenteApi.getAll().subscribe({
    this._pointVenteApi.getAllByEntreprise().subscribe({
      next: (response: any) => {
        const data = response && response.data ? response.data : [];
        // Prepend the "Tous" option which should map to null when selected
        this.listePointVente = [{ id: null, nom: 'Tous' }, ...data];

        //this.chargerEtablissement()
      },
      error: (err: any) => {
        console.log(err);
      },
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
    this.timbresTotaux = [];
    this.showTimbresTotaux = false;
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

    // Récupérer le payload sans appeler l'API totaux
    const selectedPointVenteId = this.timbresForm.value.pointDeVente;
    let pointVenteName: string | null = null;
    if (selectedPointVenteId !== null && selectedPointVenteId !== undefined) {
      const found = this.listePointVente.find(p => p.id === selectedPointVenteId);
      pointVenteName = found ? found.nom : null;
    }

    const payload = {
      dateDebut: this.timbresForm.value.dateDebut,
      dateFin: this.timbresForm.value.dateFin,
      pointDeVente: pointVenteName,
    };

    this.loading = true;
    this.chargerTimbres(payload, this.pageNum);
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

    const selectedPointVenteId = this.timbresForm.value.pointDeVente;
    let pointVenteName: string | null = null;
    if (selectedPointVenteId !== null && selectedPointVenteId !== undefined) {
      const found = this.listePointVente.find(p => p.id === selectedPointVenteId);
      pointVenteName = found ? found.nom : null;
    }

    const payload = {
      dateDebut: this.timbresForm.value.dateDebut,
      dateFin: this.timbresForm.value.dateFin,
      pointDeVente: pointVenteName
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
