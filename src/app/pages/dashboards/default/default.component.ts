import { Component, OnInit } from '@angular/core';
import { salesAnalyticsDonutChart, monthlyBarChart, revenueAreaChart } from './models/data';
import { ChartType } from './models/saas.model';
import { Etablissement } from '../../admin/etablissement/models/etablissement.model';
import { PointVente } from '../../admin/pointvente/models/pointvente.model';
import { EtablissementService } from '../../admin/etablissement/services/etablissement.service';
import { PointVenteService } from '../../admin/pointvente/services/pointvente.service';
import { OrganisationService } from '../../admin/organisations/services/organisation.service';
import { Organisation } from '../../admin/organisations/models/organisation.model';
import { KeycloakService } from 'keycloak-angular';
import { DashboardApiServices } from '../services/dashboard-api.service';
import Swal from 'sweetalert2';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

  breadCrumbItems?: Array<{}>;

  // ── Filtres ────────────────────────────────────────────────────────────────
  organisations: Organisation[] = [];
  organisationSelection: number = 0;

  etablissements: Etablissement[] = [];
  etablissementAgent: Etablissement | null = null;
  etablissementSelection: number = 0;

  pointsVentes: PointVente[] = [];
  poinventeSelection: number = 0;

  anneesExercice: any[] = [];
  anneeSelection?: number;
  anneeActuelle: number = new Date().getFullYear();
  clientSearch: string = '';

  // ── Données dashboard ──────────────────────────────────────────────────────
  dashboadData: any = null;
  hasData: boolean = false;

  // ── Indicateurs KPI calculés ───────────────────────────────────────────────
  totalRevenu: number = 0;
  totalVente: number = 0;
  totalAchat: number = 0;
  totalAvoir: number = 0;
  percentSale: number = 0;
  percentPurchase: number = 0;
  percentAvoir: number = 0;

  // Meilleur mois
  meilleurMois: string = '--';
  meilleurMoisMontant: number = 0;

  // Mois courant (index 0–11)
  private moisCourantIdx: number = new Date().getMonth();

  // ── Charts ─────────────────────────────────────────────────────────────────
  donutChart?: ChartType;
  barChart?: ChartType;
  areaChart?: ChartType;

  // Données tabulaires mensuelles
  monthlyRows: Array<{
    label: string;
    vente: number;
    achat: number;
    avoir: number;
    net: number;
  }> = [];

  // ── UI ─────────────────────────────────────────────────────────────────────
  textButton: string = btnFormState.load;
  loadingBtn: boolean = false;
  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;

  private MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  constructor(
    private organisationService: OrganisationService,
    private etablissementService: EtablissementService,
    private pointVenteService: PointVenteService,
    private _keycloakService: KeycloakService,
    private dashboardService: DashboardApiServices
  ) {
    const roles = this._keycloakService.getUserRoles();
    this.isAdmin = roles.includes('Admin');
    this.isSuperAdmin = roles.includes('Super-Admin');
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Dashboard', active: true }];
    this.initCharts();
    this.loadAnneesExercice();
    
  }

  // ── Initialisation charts vides ────────────────────────────────────────────
  private initCharts() {
    this.donutChart = { ...salesAnalyticsDonutChart };
    this.barChart = { ...monthlyBarChart };
    this.areaChart = { ...revenueAreaChart };
  }

  // ── Chargement des listes de filtres ───────────────────────────────────────
  loadAnneesExercice() {
    this.anneeSelection = this.anneeActuelle;
    for (let y = this.anneeActuelle; y >= 2025; y--) {
      this.anneesExercice.push(y);
    }

    this.loadOrganisations();
  }

  loadOrganisations() {
    this.organisationService.getAll().subscribe({
      next: (response) => {
        this.organisations = response.data;
        this.loadEtablissementAgent();
      },
      error: (err) => console.error(err)
    });
  }

  loadEtablissements() {
    this.etablissementSelection = 0;
    this.poinventeSelection = 0;
    this.etablissementService.getAllByEntrepriseId(this.organisationSelection).subscribe({
      next: (response) => {
        this.etablissements = response.data;
        if (this.etablissementAgent != null) {
          this.etablissementSelection = this.etablissementAgent.id;
          this.loadPointsVente(true);
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadEtablissementAgent() {
    this.etablissementService.getAllByKeycloakGroup().subscribe({
      next: (response) => {
        this.etablissementAgent = response.data;
        if (this.etablissementAgent != null) {
          this.organisationSelection = this.etablissementAgent.organisation.id;
          this.loadEtablissements();
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadPointsVente(isFirstLoad: boolean = false) {
    this.pointVenteService.getByEntreprise(this.etablissementSelection).subscribe({
      next: (response) => { 
        this.pointsVentes = response.data; 

        if(isFirstLoad) {
          this.loadDashboard();
        }
      },
      error: (err) => console.error(err)
    }); 
  }

  // ── Chargement du dashboard ────────────────────────────────────────────────
  loadDashboard() {
    if (this.organisationSelection === 0 && this.etablissementSelection === 0 &&
      this.poinventeSelection === 0 && this.clientSearch === '') {
      Swal.fire({
        title: 'Aucun critère renseigné',
        text: 'Veuillez renseigner au moins 1 critère de recherche avant de continuer',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.loadingBtn = true;

    const payload = {
      annee: this.anneeSelection,
      organisationId: this.organisationSelection,
      etablissementId: this.etablissementSelection,
      pointVenteId: this.poinventeSelection,
      client: this.clientSearch
    };

    this.dashboardService.getDashboard(payload).subscribe({
      next: (response: any) => {
        this.dashboadData = response;
        this.hasData = true;
        this.processData(response);
        this.initFormElement();
      },
      error: (err) => {
        this.initFormElement();
        console.error(err);
      }
    });
  }

  // ── Traitement des données reçues ──────────────────────────────────────────
  private processData(data: any) {
    this.totalVente    = +data.totalSale     || 0;
    this.totalAchat    = +data.totalPurchase || 0;
    this.totalAvoir    = +data.totalAvoir    || 0;
    this.totalRevenu   = +data.totalRevenue  || 0;
    this.percentSale   = +data.percentSale   || 0;
    this.percentPurchase = +data.percentPurchase || 0;
    this.percentAvoir  = +data.percentAvoir  || 0;

    const monthly: any[] = data.monthly || [];

    // ── Donut chart ──────────────────────────────────────────────────────────
    this.donutChart = {
      ...salesAnalyticsDonutChart,
      series: [this.totalVente, this.totalAchat, this.totalAvoir]
    };

    // ── Données mensuelles ───────────────────────────────────────────────────
    const venteData    = Array(12).fill(0);
    const achatData    = Array(12).fill(0);
    const avoirData    = Array(12).fill(0);
    const revenueData  = Array(12).fill(0);

    monthly.forEach((m: any) => {
      const idx = (m.month || 1) - 1;
      venteData[idx]   = +m.sale     || 0;
      achatData[idx]   = +m.purchase || 0;
      avoirData[idx]   = +m.avoir    || 0;
      revenueData[idx] = (venteData[idx] + achatData[idx]) - avoirData[idx];
    });

    // ── Bar chart mensuel ────────────────────────────────────────────────────
    this.barChart = {
      ...monthlyBarChart,
      series: [
        { name: 'Ventes',          data: venteData  },
        { name: 'Bordereau Achat', data: achatData  },
        { name: 'Avoirs',          data: avoirData  },
      ]
    };

    // ── Area chart CA net ────────────────────────────────────────────────────
    this.areaChart = {
      ...revenueAreaChart,
      series: [{ name: 'CA net', data: revenueData }]
    };

    // ── Tableau mensuel ──────────────────────────────────────────────────────
    this.monthlyRows = this.MOIS_LABELS.map((label, i) => ({
      label,
      vente:  venteData[i],
      achat:  achatData[i],
      avoir:  avoirData[i],
      net:    revenueData[i]
    }));

    // ── Meilleur mois ────────────────────────────────────────────────────────
    let best = 0;
    let bestIdx = -1;
    revenueData.forEach((v, i) => { if (v > best) { best = v; bestIdx = i; } });
    this.meilleurMois = bestIdx >= 0 ? this.MOIS_LABELS[bestIdx] : '--';
    this.meilleurMoisMontant = best;
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────
  changeFormElement() { this.loadingBtn = true; }
  initFormElement()   { this.textButton = btnFormState.load; this.loadingBtn = false; }

  // ── Export Excel / PDF ──────────────────────────────────────────────────────
  exportExcel(): void {
    if (!this.hasData) {
      return;
    }

    const worksheetData: Array<Array<string | number>> = [];
    worksheetData.push(['Tableau de bord']);
    worksheetData.push(['Année', this.anneeSelection ?? '']);
    worksheetData.push(['Entreprise', this.getOrganisationLabel()]);
    worksheetData.push(['Établissement', this.getEtablissementLabel()]);
    worksheetData.push(['Point de vente', this.getPointVenteLabel()]);
    worksheetData.push(['Client', this.clientSearch || 'Tous']);
    worksheetData.push([]);
    worksheetData.push(['Indicateurs', 'Valeurs']);
    worksheetData.push(['Chiffre d\'affaires net', this.totalRevenu]);
    worksheetData.push(['Ventes', this.totalVente]);
    worksheetData.push(['Bordereau Achat', this.totalAchat]);
    worksheetData.push(['Avoirs', this.totalAvoir]);
    worksheetData.push([]);
    worksheetData.push(['Mois', 'Ventes', 'Bordereau Achat', 'Avoirs', 'CA Net']);

    this.monthlyRows.forEach(row => {
      worksheetData.push([
        row.label,
        this.excelValueOrDash(row.vente),
        this.excelValueOrDash(row.achat),
        this.excelValueOrDash(row.avoir),
        this.excelValueOrDash(row.net)
      ]);
    });

    worksheetData.push([]);
    worksheetData.push(['TOTAUX', this.totalVente, this.totalAchat, this.totalAvoir, this.totalRevenu]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard_${this.anneeSelection || 'export'}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  async exportPdf(): Promise<void> {
    if (!this.hasData) {
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    // Try to load a UTF-8 TTF from assets to ensure accents and thin spaces render correctly.
    await this.loadFontIfAvailable(doc, '/assets/fonts/Roboto-Regular.ttf', 'Roboto');

    const title = 'Tableau de bord';
    doc.setFontSize(14);
    doc.text(this.sanitizeForPdf(title), 40, 40);
    doc.setFontSize(10);
    doc.text(this.sanitizeForPdf(`Année : ${this.anneeSelection ?? ''}`), 40, 60);
    doc.text(this.sanitizeForPdf(`Entreprise : ${this.getOrganisationLabel()}`), 40, 75);
    doc.text(this.sanitizeForPdf(`Établissement : ${this.getEtablissementLabel()}`), 40, 90);
    doc.text(this.sanitizeForPdf(`Point de vente : ${this.getPointVenteLabel()}`), 40, 105);
    doc.text(this.sanitizeForPdf(`Client : ${this.clientSearch || 'Tous'}`), 40, 120);

    const summaryBody = [
      ['Chiffre d\'affaires net', this.formatFCFAForPdf(this.totalRevenu)],
      ['Ventes', this.formatFCFAForPdf(this.totalVente)],
      ['Bordereau Achat', this.formatFCFAForPdf(this.totalAchat)],
      ['Avoirs', this.formatFCFAForPdf(this.totalAvoir)],
      ['Meilleur mois', this.sanitizeForPdf(`${this.meilleurMois} (${this.formatFCFAForPdf(this.meilleurMoisMontant)})`)]
    ];

    autoTable(doc, {
      startY: 140,
      body: summaryBody,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
      headStyles: { fillColor: [240, 240, 240], textColor: 0 }
    });

    const nextY = ((doc as any).previousAutoTable?.finalY || 180) + 20;
    const headers = [['Mois', 'Ventes', 'Bordereau Achat', 'Avoirs', 'CA Net']];
    const body = this.monthlyRows.map(row => [
      this.sanitizeForPdf(row.label),
      this.pdfValueOrDash(row.vente),
      this.pdfValueOrDash(row.achat),
      this.pdfValueOrDash(row.avoir),
      this.pdfValueOrDash(row.net)
    ]);
    const foot = [[
      'TOTAUX',
      this.formatFCFAForPdf(this.totalVente),
      this.formatFCFAForPdf(this.totalAchat),
      this.formatFCFAForPdf(this.totalAvoir),
      this.formatFCFAForPdf(this.totalRevenu)
    ]];

    autoTable(doc, {
      startY: nextY,
      head: headers,
      body,
      foot,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [41, 85, 204], textColor: 255 },
      footStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: 'bold' }
    });

    doc.save(`dashboard_${this.anneeSelection || 'export'}.pdf`);
  }

  private formatFCFAForPdf(val: number): string {
    if (val === null || val === undefined) return '';
    const num = Number(val);
    if (isNaN(num)) return '';

    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);

    if (abs === 0) return '0';

    const fixed = abs.toFixed(2);
    const [intPart, decPart] = fixed.split('.');

    let s: string;
    if (decPart === '00') {
      s = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(intPart));
    } else {
      s = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs);
    }

    return (sign + s).replace(/\u202F|\u00A0/g, ' ');
  }

  private sanitizeForPdf(s: string): string {
    if (!s) return s;
    return s.normalize('NFC').replace(/\u202F|\u00A0/g, ' ');
  }

  private async loadFontIfAvailable(doc: any, url: string, fontName: string): Promise<void> {
    try {
      const resp = await fetch(url);
      if (!resp.ok) return;
      const buf = await resp.arrayBuffer();
      const base64 = this.arrayBufferToBase64(buf);
      doc.addFileToVFS(`${fontName}.ttf`, base64);
      doc.addFont(`${fontName}.ttf`, fontName, 'normal');
      doc.setFont(fontName);
    } catch (e) {
      console.warn('Font load failed for PDF (optional):', e);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private excelValueOrDash(val: number): string | number {
    if (val === null || val === undefined) return '';
    const num = Number(val);
    if (isNaN(num)) return '';
    return num === 0 ? '-' : num;
  }

  private pdfValueOrDash(val: number): string {
    if (val === null || val === undefined) return '';
    const num = Number(val);
    if (isNaN(num)) return '';
    return num === 0 ? '-' : this.formatFCFAForPdf(num);
  }

  private getOrganisationLabel(): string {
    const organisation = this.organisations.find(item => item.id === this.organisationSelection);
    return organisation?.raisonSocial || 'Toutes';
  }

  private getEtablissementLabel(): string {
    
    const etablissement = this.etablissements.find(item => item.id == this.etablissementSelection);
    return etablissement?.nom || 'Tous';
  }

  private getPointVenteLabel(): string {
    const point = this.pointsVentes.find(item => item.id == this.poinventeSelection);
    return point?.nom || 'Tous';
  }

  // ── Formatage FCFA ─────────────────────────────────────────────────────────
  formatFCFA(val: number): string {
    if (val === null || val === undefined) return '';
    const num = Number(val);
    if (isNaN(num)) return '';

    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);

    // If value is zero, return '0'
    if (abs === 0) return '0';

    const fixed = abs.toFixed(2); // always 2 decimals
    const [intPart, decPart] = fixed.split('.');

    if (decPart === '00') {
      // No decimals when fractional part is .00
      return sign + new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(intPart));
    }

    // Keep two decimals otherwise
    return sign + new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs);
  }

  // ── Couleur barre progression ──────────────────────────────────────────────
  progressColorSale(pct: number): string {
    if (pct >= 60) return 'bg-success';
    if (pct >= 30) return 'bg-warning';
    return 'bg-danger';
  }
}