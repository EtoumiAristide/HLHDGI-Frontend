import { Component, OnInit, ViewChild } from '@angular/core';
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
    this.loadAnneesExercice();
    this.loadOrganisations();
    this.initCharts();
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
          this.loadPointsVente();
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

  loadPointsVente() {
    this.pointVenteService.getByEntreprise(this.etablissementSelection).subscribe({
      next: (response) => { this.pointsVentes = response.data; },
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

  // ── Formatage FCFA ─────────────────────────────────────────────────────────
  formatFCFA(val: number): string {
    return new Intl.NumberFormat('fr-FR').format(val);
  }

  // ── Couleur barre progression ──────────────────────────────────────────────
  progressColorSale(pct: number): string {
    if (pct >= 60) return 'bg-success';
    if (pct >= 30) return 'bg-warning';
    return 'bg-danger';
  }
}