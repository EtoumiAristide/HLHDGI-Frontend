import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { objectToFormData } from 'src/app/core-custom/utils/utils.service';
import { ApiPaginatedResponse } from 'src/app/shared/model/api-response.model';
import { environment } from 'src/environments/environment';
import { Organisation } from "./models/organisation.model";
import { OrganisationService } from "./services/organisation.service";

@Component({
  selector: 'app-organisations',
  templateUrl: './organisations.component.html',
  styleUrls: ['./organisations.component.css']
})
export class OrganisationsComponent {

  // bread crum data
  breadCrumbItems: Array<{}>;

  organisations: Organisation[] = [];
  organisationsFilter: Organisation[] = [];
  organisationForm: FormGroup;
  organisation: Organisation;
  formData: FormData;

  apiResponse: ApiPaginatedResponse<Organisation> = new ApiPaginatedResponse();
  // pagination variables
  pageSize = environment.pageSize;
  pageNum = 0;

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

  constructor(
    private _organisationApi: OrganisationService,
    private _toastServive: ToastService,
    private _modalService: BsModalService,
    private _router: Router,
    private fb: FormBuilder
  ) {
    this.organisationForm = fb.group({
      id: [0],
      ncc: ['', Validators.required],
      raisonSociale: ['', Validators.required],
      sigle: [''],
      logo: [null],
      indexLectureFichier: [0],
      isOrderedByPaiementMethod: [false],
      isPrixUnitaireDefined: [false],
      isFactureInitiale: [false],
      isTDTBaseTVA: [false],
      isFacturationMultiple: [false],
      isAvoirFirstVersion: [false],
      isBkWorkflow: [false],
      valeurTVA: [0.0],
      valeurTDT: [0.0],
      valeurTCN: [0],
    })

    this.organisation = new Organisation()

  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Accueil' }, { label: 'Entreprise', active: true }];
    this.getAllOrganisation();
  }

  getAllOrganisation() {
    this._organisationApi.getAllByPage({ pageNum: this.pageNum, size: this.pageSize }).subscribe({
      next: (response: any) => {
        // console.log(JSON.stringify(response))
        this.apiResponse = response as ApiPaginatedResponse<Organisation>;
        //this.organisations = this.apiResponse.content
        this.organisations = response.data
        this.organisationsFilter = this.organisations
        // this.imageURL = this.organisationForm.logo
      },
      error: error => {
        console.log(error);
      }
    });
  }

  //Gestion de la pagination
  changePage(newPage: number | string): void {
    if (newPage === 'prev') {
      this.pageNum--;
      if (this.pageNum < 0) this.pageNum = 0
    } else if (newPage === 'next') {
      this.pageNum++;
      if (this.pageNum == this.apiResponse.total_pages) this.pageNum = this.apiResponse.current_page
    }

    this.getAllOrganisation();
  }

  save() {
    if (this.organisationForm.valid) {
      // console.log("Data send: " + JSON.stringify(this.organisationForm.value));

      //Changement de l'apparance du bouton
      this.changeFormElement();

      this.formData=new FormData();

      //Ajout des données au formData
      let organisation: any = {}
      organisation.id = this.organisationForm.controls['id'].value || 0
      organisation.numcc = this.organisationForm.controls['ncc'].value
      organisation.raisonSocial = this.organisationForm.controls['raisonSociale'].value
      organisation.sigle = this.organisationForm.controls['sigle'].value
      organisation.indexLectureFichier = this.organisationForm.controls['indexLectureFichier'].value || 0
      organisation.isOrderedByPaiementMethod = this.organisationForm.controls['isOrderedByPaiementMethod'].value || false
      organisation.isPrixUnitaireDefined = this.organisationForm.controls['isPrixUnitaireDefined'].value || false
      organisation.isFactureInitiale = this.organisationForm.controls['isFactureInitiale'].value || false
      organisation.isTDTBaseTVA = this.organisationForm.controls['isTDTBaseTVA'].value || false
      organisation.isFacturationMultiple = this.organisationForm.controls['isFacturationMultiple'].value || false
      organisation.isAvoirFirstVersion = this.organisationForm.controls['isAvoirFirstVersion'].value || false
      organisation.valeurTVA = this.organisationForm.controls['valeurTVA'].value || 0
      organisation.valeurTDT = this.organisationForm.controls['valeurTDT'].value || 0
      organisation.valeurTCN = this.organisationForm.controls['valeurTCN'].value || 0
      organisation.isBkWorkflow = this.organisationForm.controls['isBkWorkflow'].value || false
      if (this.organisationForm.controls['logo'].value != null) {
        // organisation.image = this.organisationForm.controls['logo'].value
        this.formData.append('image', this.organisationForm.controls['logo'].value)
      }

      // console.log("Data send: " + JSON.stringify(this.formData));
      // this.formData = objectToFormData(organisation)
      
      this.formData.append('organisationJson', JSON.stringify(organisation));

      let apiSend: Observable<ApiPaginatedResponse<Organisation>> = this.organisationForm.controls['id'].value == 0 ? this._organisationApi.save(this.formData) : this._organisationApi.update(this.organisation.id, this.formData);

      apiSend.subscribe({
        next: response => {
          // console.log("Data receive: " + response.toString());

          this._toastServive.success("Entreprise enregistrée avec succès", "Enregistrement éffectué").onHidden.subscribe(() => {
            this.getAllOrganisation();
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

    this._organisationApi.delete(this.organisation.id).subscribe({
      next: response => {
        // console.log("Data receive: " + response);
        this._modalService.hide();
        this._toastServive.success("Catégorie supprimée avec succès", "Suppression éffectuée").onHidden.subscribe(() => {
          this.getAllOrganisation();
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
  openModal(template: TemplateRef<void>, organisationToUpdate?: Organisation, isDelete: boolean = false) {
    //console.log(organisationToUpdate);
    this.textButton = btnFormState.save;
    if (organisationToUpdate != undefined && !isDelete) {
      this.organisation = organisationToUpdate;
      this.txtModalHeader = formModalHeader.update + " d'une filiale";
      this.updateFormValues()
    } else if (organisationToUpdate != undefined && isDelete) {
      this.organisation = organisationToUpdate;
      this.textButton = btnFormState.delete;
      this.txtModalHeader = formModalHeader.delete;
      this.updateFormValues()
    } else {
      this.txtModalHeader = formModalHeader.save + " d'une filiale";
      //this.cleanFormData()
      this.updateFormValues(true)
    }

    this.modalRef = this._modalService.show(template, this.config)
  }

  //Réinitialisation des données du formulaire
  cleanFormData() {
    this.organisationForm.reset()
    this.imageURL = '';
  }

  filterData(event: any) {
    let value = event.value.toLowerCase().trim();
    //console.log(this.organisationListFilter.length)
    this.organisations = value.length != 0 ?
      this.organisations.filter(organisation => organisation.numcc.toLowerCase().trim().includes(value) ||
        organisation.raisonSocial.toLowerCase().trim().includes(value)
      ) :
      this.organisationsFilter;
  }

  goToForm() {
    this._router.navigate(['/organisation/create-filiale'])
  }

  showPreview(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.organisationForm.get('logo').setValue(file)
    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
    }
    reader.readAsDataURL(file)
  }

  // openOrganisationIndicateurPage(id: number) {
  //   this._router.navigate(['/organisation/organisation-type-indicateurs', id])
  // }
  // openOrganisationTypeIndicateurPage(id: number) {
  //   this._router.navigate(['/organisation/organisation-indicateurs', id])
  // }

  updateFormValues(isReinitData: boolean = false) {
    if (isReinitData) {
      this.organisationForm.patchValue({
        id: 0,
        ncc: '',
        raisonSociale: '',
        sigle: '',
        logo: null,
        indexLectureFichier: 0,
        isOrderedByPaiementMethod: false,
        isPrixUnitaireDefined: false,
        isFactureInitiale: false,
        isTDTBaseTVA: false,
        isFacturationMultiple: false,
        valeurTVA: 0.0,
        valeurTDT: 0.0,
        valeurTCN: 0,
        isAvoirFirstVersion: false,
        isBkWorkflow: false,
      })
    } else {
      this.organisationForm.patchValue({
        id: this.organisation.id,
        ncc: this.organisation.numcc,
        raisonSociale: this.organisation.raisonSocial,
        sigle: this.organisation.sigle,
        indexLectureFichier: this.organisation.indexLectureFichier,
        isOrderedByPaiementMethod: this.organisation.isOrderedByPaiementMethod,
        isPrixUnitaireDefined: this.organisation.isPrixUnitaireDefined,
        isFactureInitiale: this.organisation.isFactureInitiale,
        isTDTBaseTVA: this.organisation.isTDTBaseTVA,
        isFacturationMultiple: this.organisation.isFacturationMultiple,
        valeurTVA: this.organisation.valeurTVA,
        valeurTDT: this.organisation.valeurTDT,
        valeurTCN: this.organisation.valeurTCN,
        isAvoirFirstVersion: this.organisation.isAvoirFirstVersion,
        isBkWorkflow: this.organisation.isBkWorkflow,
      })

      this.imageURL = this.organisation.logo
    }
  }
}
