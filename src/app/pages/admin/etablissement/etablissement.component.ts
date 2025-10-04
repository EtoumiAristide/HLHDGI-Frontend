import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { AngularTreeGridComponent } from 'angular-tree-grid';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { ApiPaginatedResponse } from 'src/app/shared/model/api-response.model';
import Swal from 'sweetalert2';
import { Organisation } from '../organisations/models/organisation.model';
import { OrganisationService } from '../organisations/services/organisation.service';
import { EtablissementEntreprise } from './models/etablissement-organisation.model';
import { Etablissement } from './models/etablissement.model';
import { EtablissementService } from './services/etablissement.service';

@Component({
  selector: 'app-etablissement',
  templateUrl: './etablissement.component.html',
  styleUrls: ['./etablissement.component.css']
})
export class EtablissementComponent {
  // bread crum data
    breadCrumbItems: Array<{}>;
  
    organisations: Organisation[] = [];
  
    etablissements: EtablissementEntreprise[] = [];
    etablissementsFilter: Etablissement[] = [];
    etablissementForm: FormGroup;
    etablissement: Etablissement;
    etablissementSelected: Etablissement = null
  
    apiResponse: ApiPaginatedResponse<Etablissement>;
  
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
  
    etablissementDataTreeGrid: any;
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
      private _etablissementApi: EtablissementService,
      private _organisationApi: OrganisationService,
      private _toastServive: ToastService,
      private _modalService: BsModalService,
      private _router: Router,
      private fb: FormBuilder
    ) {
      this.etablissementForm = fb.group({
        id: [0],
        nom: ['', Validators.required],
        organisation: ['', Validators.required],
      })
  
      this.etablissement = new Etablissement()
  
    }
  
    ngOnInit() {
      this.breadCrumbItems = [{ label: 'Accueil' }, { label: 'Etablissement', active: true }];
      this.getAllEtablissement();
      this.getAllEntreprise();
    }
  
    getAllEntreprise() {
      this._organisationApi.getAll().subscribe({
        next: (response: any) => {
          console.log(JSON.stringify(response))
          //this.apiResponse = response as ApiPaginatedResponse<Etablissement>;
          //this.etablissements = this.apiResponse.content
          this.organisations = response.data as Organisation[]
          // this.imageURL = this.etablissementForm.logo
        },
        error: error => {
          console.log(error);
        }
      });
    }
    getAllEtablissement() {
      this._etablissementApi.sortByEntreprise().subscribe({
        next: (response: any) => {
          console.log(JSON.stringify(response))
          //this.apiResponse = response as ApiPaginatedResponse<Etablissement>;
          //this.etablissements = this.apiResponse.content
          this.etablissements = response.data as EtablissementEntreprise[]
          //this.etablissementsFilter = this.etablissements
          // this.imageURL = this.etablissementForm.logo
  
          this.setDataForTreeGrid()
        },
        error: error => {
          console.log(error);
        }
      });
    }
  
    save() {
      if (this.etablissementForm.valid) {
        //console.log("Data send: " + JSON.stringify(this.etablissementForm));
  
        //Changement de l'apparance du bouton
        this.changeFormElement();
  
        //Ajout des données au formData
        this.etablissement = new Etablissement()
        this.etablissement.id = this.etablissementForm.controls['id'].value || 0
        this.etablissement.nom = this.etablissementForm.controls['nom'].value
        this.etablissement.organisation.id = this.etablissementForm.controls['organisation'].value
  
        //console.log("Data send: " + JSON.stringify(this.formData));
  
        let apiSend: Observable<ApiPaginatedResponse<Etablissement>> = this.etablissement.id == 0 ? this._etablissementApi.save(this.etablissement) : this._etablissementApi.update(this.etablissement.id, this.etablissement);
  
        apiSend.subscribe({
          next: response => {
            // console.log("Data receive: " + response.toString());
  
            this._toastServive.success("Point de vente enregistré avec succès", "Enregistrement éffectué").onHidden.subscribe(() => {
              this.getAllEtablissement();
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
  
      this._etablissementApi.delete(this.etablissement.id).subscribe({
        next: response => {
          // console.log("Data receive: " + response);
          this._modalService.hide();
          this._toastServive.success("Catégorie supprimée avec succès", "Suppression éffectuée").onHidden.subscribe(() => {
            this.getAllEtablissement();
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
    openModal(template: TemplateRef<void>, etablissementToUpdate?: Etablissement, isDelete: boolean = false) {
      //console.log(etablissementToUpdate);
      this.textButton = btnFormState.save;
      if (etablissementToUpdate != undefined && !isDelete) {
        this.etablissement = etablissementToUpdate;
        this.txtModalHeader = formModalHeader.update + " d'une filiale";
        this.updateFormValues()
      } else if (etablissementToUpdate != undefined && isDelete) {
        this.etablissement = etablissementToUpdate;
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
      this.etablissementForm.reset()
      this.imageURL = '';
    }
  
    /*filterData(event: any) {
      let value = event.value.toLowerCase().trim();
      //console.log(this.etablissementListFilter.length)
      this.etablissements = value.length != 0 ?
        this.etablissements.filter(etablissement => etablissement.nom.toLowerCase().trim().includes(value) ||
          etablissement.organisation.raisonSocial.toLowerCase().trim().includes(value)
        ) :
        this.etablissementsFilter;
    }*/
  
    goToForm() {
      this._router.navigate(['/etablissement/create-filiale'])
    }
  
    showPreview(event) {
      const file = (event.target as HTMLInputElement).files[0];
      this.etablissementForm.get('logo').setValue(file)
      // File Preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imageURL = reader.result as string;
      }
      reader.readAsDataURL(file)
    }
  
    // openEtablissementIndicateurPage(id: number) {
    //   this._router.navigate(['/etablissement/etablissement-type-indicateurs', id])
    // }
    // openEtablissementTypeIndicateurPage(id: number) {
    //   this._router.navigate(['/etablissement/etablissement-indicateurs', id])
    // }
  
    updateFormValues(isReinitData: boolean = false) {
      if (isReinitData) {
        this.etablissementForm.patchValue({
          id: 0,
          nom: '',
          organisation: '',
        })
      } else {
        this.etablissementForm.patchValue({
          id: this.etablissement.id,
          nom: this.etablissement.nom,
          organisation: this.etablissement.organisation.id,
        })
      }
    }
  
    setDataForTreeGrid() {
      this.etablissementDataTreeGrid = []
      let idNiveau1 = 50000
  
      this.etablissements.forEach(dataEntreprise => {
        //Niveau 1
        let itemNiveau1 = {
          id: dataEntreprise.organisation.id * idNiveau1,
          parent: 0,
          name: dataEntreprise.organisation.raisonSocial,
        }
        this.etablissementDataTreeGrid.push(itemNiveau1)
  
        //Niveau 3
        dataEntreprise.etablissements.forEach(dataEtablissement => {
          let itemNiveau3 = {
            id: dataEtablissement.id,
            // parent: randomNiveau2_1,
            parent: itemNiveau1.id,
            name: dataEtablissement.nom,
          }
          this.etablissementDataTreeGrid.push(itemNiveau3)
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
      this.etablissementSelected = null
      if ($event.data) {
        for (let indexNiveau1 = 0; indexNiveau1 < this.etablissements.length; indexNiveau1++) {
          const organisationItem = this.etablissements[indexNiveau1];
          let trouver: boolean = false;
  
          for (let indexNiveau2 = 0; indexNiveau2 < organisationItem.etablissements.length; indexNiveau2++) {
            const etablissementItem = organisationItem.etablissements[indexNiveau2];
            if (etablissementItem.id == $event.data.id) {
              this.etablissementSelected = etablissementItem
  
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
      if (this.etablissementSelected == null) {
        Swal.fire("Aucune sélection", "Veuillez sélectionner un poijt de vente svp");
        // this._toastServive.error("Aucune sélection", "Veuillez sélectionner un indicateur svp")
      } else {
        this.openModal(this.templateForm, this.etablissementSelected)
      }
    }
    
    deleteSelectedItem() {
      if (this.etablissementSelected == null) {
        Swal.fire("Aucune sélection", "Veuillez sélectionner un point de vente svp");
        // this._toastServive.error("Aucune sélection", "Veuillez sélectionner un indicateur svp")
      } else {
        this.openModal(this.templateDelete, this.etablissementSelected, true)
      }
    }
}
