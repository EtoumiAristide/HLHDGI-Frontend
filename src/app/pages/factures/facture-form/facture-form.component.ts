import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { Facture } from '../model/facture.model';
import { FacturespiServices } from '../service/facture-api.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { methodePaiement, objectToFormData, typeClient, typeFacture } from 'src/app/core-custom/utils/utils.service';
import { PointVente } from '../../admin/pointvente/models/pointvente.model';
import { PointVenteService } from '../../admin/pointvente/services/pointvente.service';

@Component({
  selector: 'app-facture-form',
  templateUrl: './facture-form.component.html',
  styleUrls: ['./facture-form.component.css']
})
export class FactureFormComponent {
  pageTitle: string = "Facture"

  pageChanged($event: any) {
    throw new Error('Method not implemented.');
  }
  // bread crum data
  breadCrumbItems: Array<{}>;

  term: any
  // Table data
  factureForm!: FormGroup;
  facture: Facture

  deleteId: any;

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

  listeTypeFacture: any = typeFacture
  typeClient: any = typeClient
  methodePaiement: any = methodePaiement

  listePointVente: PointVente[] = []

  formData: FormData

  extractedFactureData?: any[]
  isLoadFacture: boolean = false

  constructor(
    private _factureApi: FacturespiServices,
    private _pointVenteApi: PointVenteService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private _toastServive: ToastService,
    private _router: Router,
  ) {


    this.facture = new Facture()

    this.factureForm = this.fb.group({
      id: [0],
      typeFacture: ['', Validators.required],
      typeClient: ['', Validators.required],
      modePaiement: ['', Validators.required],
      pointVente: ['', Validators.required],
      fichier: [null, Validators.required]
    })

    this.isModif = false

    this.formData = new FormData()

  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Accueil', url: '/' }, { label: 'Factures', url: '/factures' }, { label: 'Form', active: true }];

    this.chargerPointVente()
  }

  chargerPointVente() {
    // this._pointVenteApi.getAll().subscribe({
    this._pointVenteApi.getAllByEntreprise().subscribe({
      next: (response) => {
        console.log(response);

        this.listePointVente = response.data
      },
      error(err) {
        console.log(err);

      },
    })
  }

  //Ajout d'un nouvel élément
  save() {
    if (this.factureForm.valid) {
      console.log("Data form: " + JSON.stringify(this.factureForm.value));

      this.changeFormElement();

      let dataToSend: any = {}
      dataToSend.type = this.factureForm.controls['typeFacture'].value
      dataToSend.file = this.factureForm.controls['fichier'].value
      dataToSend.client = this.factureForm.controls['typeClient'].value
      dataToSend.paiement = this.factureForm.controls['modePaiement'].value
      dataToSend.pointvente = this.listePointVente.find(pointVente => pointVente.id == this.factureForm.controls['pointVente'].value).nom

      this.formData = objectToFormData(dataToSend)

      let apiSend: Observable<Object> = !this.isModif ? this._factureApi.save(this.formData) : this._factureApi.update(this.facture.id, this.formData);

      apiSend.subscribe({
        next: response => {

          this._toastServive.success(this.pageTitle + " enregistré avec succès", "Enregistrement éffectué").onHidden.subscribe(() => {
            this.initFormElement(true);
            this.openViewList()

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
      dataToSend.client = this.factureForm.controls['typeClient'].value
      dataToSend.paiement = this.factureForm.controls['modePaiement'].value
      dataToSend.pointvente = this.factureForm.controls['pointVente'].value

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

            this.apiCallError = error.error
          });
        }
      });
    }
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
    this.extractedFactureData = [{}]
  }

  openViewList() {
    this._router.navigate(['/factures'])
  }

}
