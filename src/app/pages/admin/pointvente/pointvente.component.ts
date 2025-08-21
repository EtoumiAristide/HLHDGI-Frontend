import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, FormGroup, FormsModule, NgForm, NgModel, Validators } from '@angular/forms';
import { ApiPaginatedResponse } from 'src/app/shared/model/api-response.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { objectToFormData } from 'src/app/core-custom/utils/utils.service';
import { PointVente } from './models/pointvente.model';
import { Organisation } from '../organisations/models/organisation.model';
import { OrganisationService } from '../organisations/services/organisation.service';
import { PointVenteService } from './services/pointvente.service';
import Swal from 'sweetalert2';
import { AngularTreeGridComponent } from 'angular-tree-grid';
import { PointVenteEntreprise } from './models/point-vente-organisation.model';

@Component({
  selector: 'app-pointvente',
  templateUrl: './pointvente.component.html',
  styleUrls: ['./pointvente.component.css']
})
export class PointventeComponent {
  // bread crum data
  breadCrumbItems: Array<{}>;

  organisations: Organisation[] = [];

  pointVentes: PointVenteEntreprise[] = [];
  pointVentesFilter: PointVente[] = [];
  pointVenteForm: FormGroup;
  pointVente: PointVente;
  pointVenteSelected: PointVente = null

  apiResponse: ApiPaginatedResponse<PointVente>;

  loadingBtn: boolean = false;
  textButton: string = btnFormState.save;
  txtModalHeader = formModalHeader.save;

  modalRef?: BsModalRef;
  //Empeche le modal de se fermer sans avoir cliquer sur le bouton de fermeture
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-md'
  };
  imageURL: string;

  isModif: boolean = false;
  isView: boolean = false;

  idToUpdate: number = 0;

  pointVenteDataTreeGrid: any;
  @ViewChild('angularGrid') angularGrid: AngularTreeGridComponent;
  @ViewChild('expandBtn') expandBtn: ElementRef;
  @ViewChild('templateForm') templateForm: TemplateRef<void>;
  @ViewChild('templateDelete') templateDelete: TemplateRef<void>;

  treeIsExpanded: boolean = false;

  configs: any = {
    id_field: 'id',
    parent_id_field: 'parent',
    parent_display_field: 'name',
    css: { // Optional
      expand_icon: '<i class="fas fa-caret-right fa-lg"></i>',
      collapse_icon: '<i class="fas fa-caret-down fa-lg"></i>',
      // table_class: 'table table-hover table-responsive'
    },
    data_loading_text: 'Aucune donnée disponible',
    filter: true,
    multi_select: true,
    columns: [
      {
        name: 'name',
        header: 'Entreprise',
        // renderer: function(value) {
        //   return value + ' years';
        // }
        width: '100%'
      },
    ]
  };

  constructor(
    private _pointVenteApi: PointVenteService,
    private _organisationApi: OrganisationService,
    private _toastServive: ToastService,
    private _modalService: BsModalService,
    private _router: Router,
    private fb: FormBuilder
  ) {
    this.pointVenteForm = fb.group({
      id: [0],
      nom: ['', Validators.required],
      organisation: ['', Validators.required],
    })

    this.pointVente = new PointVente()

  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Accueil' }, { label: 'Point de vente', active: true }];
    this.getAllPointVente();
    this.getAllEntreprise();
  }

  getAllEntreprise() {
    this._organisationApi.getAll().subscribe({
      next: (response: any) => {
        console.log(JSON.stringify(response))
        //this.apiResponse = response as ApiPaginatedResponse<PointVente>;
        //this.pointVentes = this.apiResponse.content
        this.organisations = response as Organisation[]
        // this.imageURL = this.pointVenteForm.logo
      },
      error: error => {
        console.log(error);
      }
    });
  }
  getAllPointVente() {
    this._pointVenteApi.getAllByEntreprise().subscribe({
      next: (response: any) => {
        console.log(JSON.stringify(response))
        //this.apiResponse = response as ApiPaginatedResponse<PointVente>;
        //this.pointVentes = this.apiResponse.content
        this.pointVentes = response as PointVenteEntreprise[]
        //this.pointVentesFilter = this.pointVentes
        // this.imageURL = this.pointVenteForm.logo

        this.setDataForTreeGrid()
      },
      error: error => {
        console.log(error);
      }
    });
  }

  save() {
    if (this.pointVenteForm.valid) {
      //console.log("Data send: " + JSON.stringify(this.pointVenteForm));

      //Changement de l'apparance du bouton
      this.changeFormElement();

      //Ajout des données au formData
      this.pointVente = new PointVente()
      this.pointVente.id = this.pointVenteForm.controls['id'].value || 0
      this.pointVente.nom = this.pointVenteForm.controls['nom'].value
      this.pointVente.organisation.id = this.pointVenteForm.controls['organisation'].value

      //console.log("Data send: " + JSON.stringify(this.formData));

      let apiSend: Observable<ApiPaginatedResponse<PointVente>> = this.pointVente.id == 0 ? this._pointVenteApi.save(this.pointVente) : this._pointVenteApi.update(this.pointVente.id, this.pointVente);

      apiSend.subscribe({
        next: response => {
          // console.log("Data receive: " + response.toString());

          this._toastServive.success("Point de vente enregistré avec succès", "Enregistrement éffectué").onHidden.subscribe(() => {
            this.getAllPointVente();
            this.initFormElement(true);

            this._modalService.hide();
          })
        },
        error: error => {
          console.error("There is an error !", error);
          this._toastServive.error("Une erreur est survenue", "Enregistrement échoué").onHidden.subscribe(() => {
            this.initFormElement();
          });
        }
      });
    }
  }

  delete() {
    //Changement de l'apparance du bouton
    this.changeFormElement();

    this._pointVenteApi.delete(this.pointVente.id).subscribe({
      next: response => {
        // console.log("Data receive: " + response);
        this._modalService.hide();
        this._toastServive.success("Catégorie supprimée avec succès", "Suppression éffectuée").onHidden.subscribe(() => {
          this.getAllPointVente();
          this.initFormElement(true);

        })
      },
      error: error => {
        console.error("There is an error !", error);
        this._modalService.hide();
        this._toastServive.error("Une erreur est survenue", "Suppression échouée").onHidden.subscribe(() => {
          this.initFormElement();
        });
      }
    });
  }

  //Changement de l'état du bouton du formulaire
  changeFormElement() {
    this.loadingBtn = true;
    this.textButton = btnFormState.processing
  }

  //Réinitialisation des composants du formulaire
  initFormElement(isReinitData: boolean = false) {
    this.textButton = btnFormState.save
    this.loadingBtn = false;

    if (isReinitData) {
      this.cleanFormData();
      //this._modalService.hide();
      this.txtModalHeader = formModalHeader.save;
    }
  }

  //Ouvre le formulaire en modal pour la création, la mise à jour ou la suppression
  openModal(template: TemplateRef<void>, pointVenteToUpdate?: PointVente, isDelete: boolean = false) {
    //console.log(pointVenteToUpdate);
    this.textButton = btnFormState.save;
    if (pointVenteToUpdate != undefined && !isDelete) {
      this.pointVente = pointVenteToUpdate;
      this.txtModalHeader = formModalHeader.update + " d'une filiale";
      this.updateFormValues()
    } else if (pointVenteToUpdate != undefined && isDelete) {
      this.pointVente = pointVenteToUpdate;
      this.textButton = btnFormState.delete;
      this.txtModalHeader = formModalHeader.delete;
      this.updateFormValues()
    } else {
      this.txtModalHeader = formModalHeader.save + " d'une filiale";
      this.cleanFormData()
    }

    this.modalRef = this._modalService.show(template, this.config)
  }

  //Réinitialisation des données du formulaire
  cleanFormData() {
    this.pointVenteForm.reset()
    this.imageURL = '';
  }

  /*filterData(event: any) {
    let value = event.value.toLowerCase().trim();
    //console.log(this.pointVenteListFilter.length)
    this.pointVentes = value.length != 0 ?
      this.pointVentes.filter(pointVente => pointVente.nom.toLowerCase().trim().includes(value) ||
        pointVente.organisation.raisonSocial.toLowerCase().trim().includes(value)
      ) :
      this.pointVentesFilter;
  }*/

  goToForm() {
    this._router.navigate(['/pointVente/create-filiale'])
  }

  showPreview(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.pointVenteForm.get('logo').setValue(file)
    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
    }
    reader.readAsDataURL(file)
  }

  // openPointVenteIndicateurPage(id: number) {
  //   this._router.navigate(['/pointVente/pointVente-type-indicateurs', id])
  // }
  // openPointVenteTypeIndicateurPage(id: number) {
  //   this._router.navigate(['/pointVente/pointVente-indicateurs', id])
  // }

  updateFormValues(isReinitData: boolean = false) {
    if (isReinitData) {
      this.pointVenteForm.patchValue({
        id: 0,
        nom: '',
        organisation: '',
      })
    } else {
      this.pointVenteForm.patchValue({
        id: this.pointVente.id,
        nom: this.pointVente.nom,
        organisation: this.pointVente.organisation.id,
      })
    }
  }

  setDataForTreeGrid() {
    this.pointVenteDataTreeGrid = []
    let idNiveau1 = 50000

    this.pointVentes.forEach(dataEntreprise => {
      //Niveau 1
      let itemNiveau1 = {
        id: dataEntreprise.organisation.id * idNiveau1,
        parent: 0,
        name: dataEntreprise.organisation.raisonSocial,
      }
      this.pointVenteDataTreeGrid.push(itemNiveau1)

      //Niveau 3
      dataEntreprise.pointVentes.forEach(dataPointVente => {
        let itemNiveau3 = {
          id: dataPointVente.id,
          // parent: randomNiveau2_1,
          parent: itemNiveau1.id,
          name: dataPointVente.nom,
        }
        this.pointVenteDataTreeGrid.push(itemNiveau3)
      })

    })
    //console.log(this.indicateurDatasTreeGrid);
    this.angularGrid.expandAll()
  }

  expandTree() {
    this.treeIsExpanded = !this.treeIsExpanded
    this.treeIsExpanded ? this.angularGrid.expandAll() : this.angularGrid.collapseAll()
  }

  nodeChecked($event) {
    // console.log($event);
    this.pointVenteSelected = null
    if ($event.data) {
      for (let indexNiveau1 = 0; indexNiveau1 < this.pointVentes.length; indexNiveau1++) {
        const organisationItem = this.pointVentes[indexNiveau1];
        let trouver: boolean = false;

        for (let indexNiveau2 = 0; indexNiveau2 < organisationItem.pointVentes.length; indexNiveau2++) {
          const pointVenteItem = organisationItem.pointVentes[indexNiveau2];
          if (pointVenteItem.id == $event.data.id) {
            this.pointVenteSelected = pointVenteItem

            trouver = true
            break
          }
        }
        if(trouver) break

      }
    }
    // console.log(this.indicateurSelected);

  }

  editSelectedItem() {
    if (this.pointVenteSelected == null) {
      Swal.fire("Aucune sélection", "Veuillez sélectionner un poijt de vente svp");
      // this._toastServive.error("Aucune sélection", "Veuillez sélectionner un indicateur svp")
    } else {
      this.openModal(this.templateForm, this.pointVenteSelected)
    }
  }
  
  deleteSelectedItem() {
    if (this.pointVenteSelected == null) {
      Swal.fire("Aucune sélection", "Veuillez sélectionner un point de vente svp");
      // this._toastServive.error("Aucune sélection", "Veuillez sélectionner un indicateur svp")
    } else {
      this.openModal(this.templateDelete, this.pointVenteSelected, true)
    }
  }
}
