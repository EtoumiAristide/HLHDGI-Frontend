import { Component, OnInit, ViewChild } from '@angular/core';
import { salesAnalyticsDonutChart } from './models/data';
import { ChartType } from './models/saas.model';
import { ChartType2 } from './models/blog.model';
import { popularPostData, visitorsOptions } from './models/data.blog';
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

  breadCrumbItems: Array<{}>;

  organisations: Organisation[] = [];
  organisationSelection: number = 0;

  etablissements: Etablissement[] = [];
  etablissementAgent: Etablissement | null = null
  etablissementSelection: number = 0;

  pointsVentes: PointVente[] = [];
  poinventeSelection: number = 0;

  anneesExercice: any[] = [];
  anneeSelection: number;
  anneeActuelle: number = new Date().getFullYear();

  clientSearch: string = ''

  dashboadData!: any

  salesAnalyticsDonutChart: ChartType;

  textButton: string = btnFormState.load
  loadingBtn: boolean = false;

  // visitor chart
  visitorsOptions: ChartType2;
  popularPostData: any;


  isAdmin: boolean = false;
  isSuperAdmin: boolean = false

  constructor(
    private organisationService: OrganisationService,
    private etablissementService: EtablissementService,
    private pointVenteService: PointVenteService,
    private _keycloakService: KeycloakService,
    private dashboardService: DashboardApiServices
  ) {

    const roles = this._keycloakService.getUserRoles();

    this.isAdmin = roles.includes('Admin')
    this.isSuperAdmin = roles.includes('Super-Admin')
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Dashboard', active: true }];

    this.loadAnneesExercice();
    this.loadOrganisations()

    this.salesAnalyticsDonutChart = salesAnalyticsDonutChart;

    this.visitorsOptions = visitorsOptions;
    this.popularPostData = popularPostData;
  }

  loadAnneesExercice() {
    this.anneeSelection = this.anneeActuelle;
    for (let index = this.anneeActuelle; index >= 2025; index--) {
      this.anneesExercice.push(index);
    }

  }

  loadOrganisations() {
    this.organisationService.getAll().subscribe({
      next: (response) => {
        this.organisations = response.data

        this.loadEtablissementAgent()
      },
      error: (err) => {
        console.error(err)
      }
    })
  }

  loadEtablissements() {
    this.etablissementSelection = 0
    this.poinventeSelection = 0

    this.etablissementService.getAllByEntrepriseId(this.organisationSelection).subscribe({
      next: (response) => {
        this.etablissements = response.data;

        if (this.etablissementAgent != null) {
          this.etablissementSelection = this.etablissementAgent.id

          this.loadPointsVente()
        }
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  loadEtablissementAgent() {
    this.etablissementService.getAllByKeycloakGroup().subscribe({
      next: (response) => {
        // console.log(response);

        this.etablissementAgent = response.data;

        if (this.etablissementAgent != null) {
          this.organisationSelection = this.etablissementAgent.organisation.id

          this.loadEtablissements()
        }

      },
      error: (err) => {
        console.error(err)
      }
    })
  }

  loadPointsVente() {
    this.pointVenteService.getByEntreprise(this.etablissementSelection).subscribe({
      next: (response) => {
        this.pointsVentes = response.data;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  loadDashboard() {
    if (this.organisationSelection == 0 && this.etablissementSelection == 0 &&
      this.poinventeSelection == 0 && this.clientSearch == '') {

      Swal.fire({
        title: 'Aucun critère renseigné',
        text: 'Veuillez renseigner au moins 1 critère de recherche avant de continuer',
        confirmButtonText: 'OK'
      })
    } else {
      this.changeFormElement()

      let dataSend: any = {}
      dataSend.annee = this.anneeSelection
      dataSend.organisationId = this.organisationSelection
      dataSend.etablissementId = this.etablissementSelection
      dataSend.pointVenteId = this.poinventeSelection
      dataSend.client = this.clientSearch

      this.dashboardService.getDashboard(dataSend).subscribe({
        next: (response) => {
          this.dashboadData = response

          console.log(this.dashboadData);
          this.initFormElement()

        },
        error: (err) => {
          this.initFormElement()
          console.error(err)
        }
      })
    }
  }

  changeFormElement() {
    this.loadingBtn = true
  }

  initFormElement() {
    this.textButton = btnFormState.load
    this.loadingBtn = false
  }

}