import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { FacturespiServices } from './service/facture-api.service';
import { Facture } from './model/facture.model';
import { Router } from '@angular/router';
import { objectToFormData } from 'src/app/core-custom/utils/utils.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-factures',
  templateUrl: './factures.component.html',
  styleUrls: ['./factures.component.css']
})
export class FacturesComponent {
  pageTitle: string = "Facture"

  pageChanged($event: any) {
    throw new Error('Method not implemented.');
  }
  // bread crum data
  breadCrumbItems: Array<{}>;

  term: any
  factureList: Facture[] = []
  // Table data
  total: Observable<number>;
  factureForm: FormGroup;
  facture: Facture

  deleteId: any;
  factureListeSearch: Facture[]

  modalRef?: BsModalRef;
  config: any = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-lg modal-dialog-centered'
  };

  //COnfiguration du bouton lors de la validation
  loadingBtn: boolean = false;
  loadingBtnFac: boolean = false;
  textButton: string = btnFormState.save;
  textButtonFac: string = btnFormState.load;
  txtModalHeader = formModalHeader.save

  isModif: boolean;
  isView: boolean;

  apiCallError: any

  listeTypeFacture: any = [
    {
      'label': 'FACTURE DE VENTE',
      'valeur': 'FACTURE_VENTE',
    },
    {
      'label': "FACTURE D'AVOIR",
      'valeur': 'FACTURE_AVOIR',
    },
    {
      'label': "BORDERAU D'ACHAT",
      'valeur': 'FACTURE_VENTE',
    },
  ]

  formData: FormData

  extractedFactureData?: any
  isLoadFacture: boolean = false

  pageSize = environment.pageSize;
  pageNum = 0;

  constructor(
    private _factureApi: FacturespiServices,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private _toastServive: ToastService,
    private _router: Router,
  ) {


    this.facture = new Facture()

    this.factureForm = this.fb.group({
      id: [0],
      typeFacture: ['', Validators.required],
      fichier: [null, Validators.required]
    })

    this.isModif = false

    this.formData = new FormData()

  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Accueil' }, { label: 'Factures', active: true }];
    this.chargerListeFacture()
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any, dataToUpdate: Facture, isModif: boolean = false, isView: boolean = false, isDelete: boolean = false) {

    this.clearForm()

    if (isModif || isView) {
      this.facture = dataToUpdate
      this.mapObjectToForm()
    }
    this.txtModalHeader = isModif ? formModalHeader.update + ' ' + this.pageTitle : isView ? formModalHeader.show + ' ' + this.pageTitle : isDelete ? formModalHeader.delete + ' ' + this.pageTitle : formModalHeader.save + ' ' + this.pageTitle;
    if (isDelete) {
      this.facture = dataToUpdate
      this.config.class = "modal-md modal-dialog-centered"
    }
    this.isModif = isModif
    this.isView = isView

    this.modalRef = this.modalService.show(content, this.config);
  }

  openForm(isModif: boolean = false, isView: boolean = false, id: number = 0) {
    if (isModif) {
      this._router.navigate(['factures/edit', id])
    } else if (isView) {
      this._router.navigate(['factures/view', id])
    } else {
      this._router.navigate(['factures/create'])
    }
  }

  chargerListeFacture() {
    // this._factureApi.getAll().subscribe({
    this._factureApi.getAllByEntreprise({ pageNum: this.pageNum, size: this.pageSize }).subscribe({
      next: (response) => {
        // console.log(response);

        this.factureList = response.data
        this.factureListeSearch = response.data
      },
      error(err) {
        console.log(err);

      },
    })
  }

  // filter job
  search() {
    if (this.term) {
      this.factureList = this.factureListeSearch.filter((data: any) => {
        return data.facture.toLowerCase().includes(this.term.toLowerCase())
          || data.login.toLowerCase().includes(this.term.toLowerCase())
          || data.user.toLowerCase().includes(this.term.toLowerCase())
          || data.userid.toLowerCase().includes(this.term.toLowerCase())
          || data.pincode.toLowerCase().includes(this.term.toLowerCase())
          || data.serialno.toLowerCase().includes(this.term.toLowerCase())
          || data.password.toLowerCase().includes(this.term.toLowerCase())
          || data.vtype.toLowerCase().includes(this.term.toLowerCase())
          || data.vcode.toLowerCase().includes(this.term.toLowerCase())
          || data.deviceno.toLowerCase().includes(this.term.toLowerCase())
          || data.groupid.toLowerCase().includes(this.term.toLowerCase())
      })
    } else {
      this.factureList = this.factureListeSearch
    }
  }

  //Ajout d'un nouvel élément
  save() {
    if (this.factureForm.valid) {
      console.log("Data form: " + JSON.stringify(this.factureForm.value));

      this.changeFormElement();

      let dataToSend: any = {}
      dataToSend.type = this.factureForm.controls['typeFacture'].value
      dataToSend.file = this.factureForm.controls['fichier'].value

      this.formData = objectToFormData(dataToSend)

      let apiSend: Observable<Object> = !this.isModif ? this._factureApi.save(this.formData) : this._factureApi.update(this.facture.id, this.formData);

      apiSend.subscribe({
        next: response => {

          this._toastServive.success(this.pageTitle + " enregistré avec succès", "Enregistrement éffectué").onHidden.subscribe(() => {
            this.chargerListeFacture();
            this.initFormElement(true);

          })
        },
        error: error => {
          console.error("There is an error !", error);
          this._toastServive.error("Une erreur est survenue", "Enregistrement échoué").onHidden.subscribe(() => {
            this.initFormElement();
            //this.apiCallError = error.error.data
          });
        }
      });
    }
  }

  loadFromFile() {
    if (this.factureForm.valid) {
      console.log("Data form: " + JSON.stringify(this.factureForm.value));

      this.changeFormElement();

      let dataToSend: any = {}
      dataToSend.type = this.factureForm.controls['typeFacture'].value
      dataToSend.file = this.factureForm.controls['fichier'].value

      this.formData = objectToFormData(dataToSend)

      let apiSend: Observable<Object> = this._factureApi.loadFromFile(this.formData)

      apiSend.subscribe({
        next: (response: any) => {
          console.log(response);
          this.extractedFactureData = response.data
          this.isLoadFacture = true

          this._toastServive.success(" Données de facture extraites avec succès", "Extraction éffectué").onHidden.subscribe(() => {
            this.initFormElement(false);

          })
        },
        error: error => {
          console.error("There is an error !", error);
          this._toastServive.error("Une erreur est survenue", "Enregistrement échoué").onHidden.subscribe(() => {
            this.initFormElement();
            this.isLoadFacture = false
            // console.log(JSON.stringify(error));

            this.apiCallError = error.message
          });
        }
      });
    }
  }

  //Suppression d'un élément
  delete() {
    //Changement de l'apparance du bouton
    this.changeFormElement();

    this._factureApi.delete(this.facture.id).subscribe({
      next: response => {
        // console.log("Data receive: " + response);

        this._toastServive.success(this.pageTitle + " supprimé avec succès", "Suppression éffectuée").onHidden.subscribe(() => {
          this.chargerListeFacture();
          this.initFormElement(true);

        })
      },
      error: error => {
        console.error("There is an error !", error);
        this._toastServive.error("Une erreur est survenue", "Suppression échouée").onHidden.subscribe(() => {
          this.initFormElement();
          this.apiCallError = error.error.data
        });
      }
    });
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);

      this.factureForm.controls['fichier']?.setValue(file)
    }
  }

  //Modification de l'apparence visuelle du bouton "Valider"
  changeFormElement(isFacture: boolean = false) {
    !isFacture ? this.loadingBtn = true : this.loadingBtnFac = true;
    !isFacture ? this.textButton = btnFormState.processing : this.textButtonFac = btnFormState.processing
  }

  //Remise à l'état initial du bouton "Valider" et des données du formulaire
  initFormElement(isReinitData: boolean = false) {
    this.textButton = btnFormState.save
    this.textButtonFac = btnFormState.load
    this.loadingBtn = false;
    this.loadingBtnFac = false;
    this.apiCallError = undefined

    if (isReinitData) {
      this.clearForm()
      this.isLoadFacture = false
      this.modalService.hide(this.modalRef?.id);
      this.txtModalHeader = formModalHeader.save + ' ' + this.pageTitle;
    }
  }

  mapFormToObject() {
    this.facture.numFacture = this.factureForm.controls['numFacture'].value
    this.facture.nomClient = this.factureForm.controls['nomClient'].value
    this.facture.dateFacture = this.factureForm.controls['dateFacture'].value
    this.facture.typeFacture = this.factureForm.controls['typeFacture'].value
  }

  // Mise à jour des champs du formulaire
  mapObjectToForm() {
    this.factureForm.patchValue({
      numFacture: this.facture.numFacture,
      nomClient: this.facture.nomClient,
      dateFacture: this.facture.dateFacture,
      typeFacture: this.facture.typeFacture,
    })
  }

  clearForm() {
    this.facture = new Facture()
    this.factureForm.reset()
    this.extractedFactureData = {}
  }

  showFactureGenere(data: Facture) {
    if (data && data.reponseFNE) {
      const url = data.reponseFNE.token;
      console.log(data.reponseFNE);
      
      window.open(url, '_blank'); 
    }
  }
}
