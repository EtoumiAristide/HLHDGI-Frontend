import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { methodePaiement, objectToFormData, typeClient, typeFacture } from 'src/app/core-custom/utils/utils.service';
import { PointVente } from '../../admin/pointvente/models/pointvente.model';
import { PointVenteService } from '../../admin/pointvente/services/pointvente.service';
import { Facture } from '../model/facture.model';
import { FacturespiServices } from '../service/facture-api.service';
import { Payment } from '../model/payment.model';
import { el } from '@fullcalendar/core/internal-common';


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
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  montantTimbre: number = 0;
  isLoadFacture: boolean = false
  selectedType: string = 'ALL';
  isLoading: boolean = false;
  isFactureAvoir: boolean = false;
  isFactureAvoirLoad: boolean = false;

  paymentTypes = [
    { value: 'ALL', label: 'Tous les paiements' },
    { value: 'CASH', label: 'Espèces' },
    { value: 'BACKUP_CC', label: 'Backup CC' },
    { value: 'HD_GLOVO', label: 'HD Glovo' },
    { value: 'CASH_WAVE', label: 'Cash Wave' }
  ];

  urlFacture: string = ''
  reponseFNE: any = {}

  // userEtablissement: string = ''
  isOrderedByPaiementMethod: boolean = false

  @ViewChild('templateModal') templateModal: TemplateRef<void>;

  constructor(
    private _factureApi: FacturespiServices,
    private _pointVenteApi: PointVenteService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private _toastServive: ToastService,
    private _router: Router,
    private _keycloakService: KeycloakService,
    private _modalService: BsModalService,
  ) {


    this.facture = new Facture()

    this.factureForm = this.fb.group({
      id: [0],
      typeFacture: ['', Validators.required],
      typeClient: ['', Validators.required],
      modePaiement: [''],
      pointVente: ['', Validators.required],
      fichier: [null, Validators.required],
      numeroFacture: [''],
    })

    this.isModif = false

    this.formData = new FormData()

  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Accueil', url: '/' }, { label: 'Factures', url: '/factures' }, { label: 'Form', active: true }];

    this.chargerPointVente()
    // const token = this._keycloakService.getKeycloakInstance().token
    // const decode: any = jwtDecode(token)
    // if (decode.groups != undefined && decode.groups.length != 0) this.userEtablissement = decode.groups[0]
    // //console.log(this.userEntreprise);
    // this.isentrepriseBK = environment.entpriseBK.includes(this.userEtablissement)

  }

  chargerPointVente() {
    // this._pointVenteApi.getAll().subscribe({
    this._pointVenteApi.getAllByEntreprise().subscribe({
      next: (response) => {
        // console.log(response);

        this.listePointVente = response.data
        if (this.listePointVente.length != 0) this.isOrderedByPaiementMethod = this.listePointVente[0].etablissement.organisation.isOrderedByPaiementMethod
      },
      error(err) {
        console.log(err);

      },
    })
  }

  //Ajout d'un nouvel élément
  save() {
    if (this.factureForm.valid) {
      // console.log("Data form: " + JSON.stringify(this.factureForm.value));

      this.changeFormElement();

      let dataToSend: any = {}
      dataToSend.type = this.factureForm.controls['typeFacture'].value
      if (this.isFactureAvoir) {
        dataToSend.numeroFacture = this.factureForm.controls['numeroFacture'].value
      } else {

        dataToSend.file = this.factureForm.controls['fichier'].value
        dataToSend.client = this.factureForm.controls['typeClient'].value
        dataToSend.paiement = this.factureForm.controls['modePaiement'].value
        dataToSend.pointvente = this.listePointVente.find(pointVente => pointVente.id == this.factureForm.controls['pointVente'].value).nom
      }
      this.formData = objectToFormData(dataToSend)

      let apiSend: Observable<Object> = !this.isFactureAvoir ? this._factureApi.save(this.formData) : this._factureApi.saveAvoir(this.formData);

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
      // console.log("Data form: " + JSON.stringify(this.factureForm.value));

      this.changeFormElement();

      let dataToSend: any = {}
      dataToSend.type = this.factureForm.controls['typeFacture'].value
      if (this.isFactureAvoir) {
        dataToSend.numeroFacture = this.factureForm.controls['numeroFacture'].value
      } else {
        dataToSend.type = this.factureForm.controls['typeFacture'].value
        dataToSend.file = this.factureForm.controls['fichier'].value
        dataToSend.client = this.factureForm.controls['typeClient'].value
        dataToSend.paiement = this.factureForm.controls['modePaiement'].value
        dataToSend.pointvente = this.factureForm.controls['pointVente'].value
        this.formData = objectToFormData(dataToSend)
      }


      let apiSend: Observable<Object> = this.isFactureAvoir ? this._factureApi.getByNumfne(this.factureForm.controls['numeroFacture'].value) : this._factureApi.loadFromFile(this.formData)

      apiSend.subscribe({
        next: (response: any) => {
          //console.log(response);

          if (this.isFactureAvoir) {
            this.isFactureAvoirLoad = true;
            if (response.data && response.data.reponseFNE) {
              this.reponseFNE = JSON.parse(response.data.reponseFNE)
              this.urlFacture = this.reponseFNE.token;
              // console.log(data.reponseFNE);
            }
          } else {
            this.isFactureAvoirLoad = false;
            this.isLoadFacture = true
            this.extractedFactureData = response.data.factures

            if (response.data.payments != undefined) {
              this.payments = response.data.payments
              this.filteredPayments = response.data.payments;
              this.montantTimbre = this.payments.filter(payment => payment.amount > 5000).length * 100;
            }
          }

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

  openModal(template: TemplateRef<void>) {
    //console.log(etablissementToUpdate);
    this.modalRef = this._modalService.show(template, this.config)
  }

  onTypeChange(): void {
    if (this.selectedType === 'ALL') {
      this.filteredPayments = this.payments;
    } else {
      /*this.reportService.getPaymentsByType(this.selectedType).subscribe({
        next: (data) => {
          this.filteredPayments = data;
        },
        error: (error) => {
          console.error('Erreur lors du filtrage:', error);
        }
      });*/
      this.filteredPayments = this.payments.filter(payment => payment.paymentType === this.selectedType);
      this.montantTimbre = this.filteredPayments.filter(payment => payment.amount > 5000).length * 100;
    }
  }

  getTotalAmount(): number {
    return this.filteredPayments.reduce((sum, payment) => sum + payment.total, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  }

  getPaymentTypeClass(type: string): string {
    return `badge-${type}`;
  }

  selectionTypeFacture() {
    const selectedType = this.factureForm.get('typeFacture')?.value;
    console.log(selectedType);

    if (selectedType === 'FACTURE_AVOIR') {
      this.isFactureAvoir = true;

      // this.factureForm.get('modePaiement')?.clearValidators();
      this.factureForm.get('typeClient')?.clearValidators();
      this.factureForm.get('typeClient')?.updateValueAndValidity();
      this.factureForm.get('pointVente')?.clearValidators();
      this.factureForm.get('pointVente')?.updateValueAndValidity();
      this.factureForm.get('fichier')?.clearValidators();
      this.factureForm.get('fichier')?.updateValueAndValidity();

      this.factureForm.get('numeroFacture')?.addValidators(Validators.required);
      this.factureForm.get('numeroFacture')?.updateValueAndValidity();

    } else {
      this.isFactureAvoir = false;

      this.factureForm.get('numeroFacture')?.clearValidators();
      this.factureForm.get('numeroFacture')?.updateValueAndValidity();

      // this.factureForm.get('modePaiement')?.addValidators(Validators.required);
      this.factureForm.get('typeClient')?.addValidators(Validators.required);
      this.factureForm.get('typeClient')?.updateValueAndValidity();
      this.factureForm.get('pointVente')?.addValidators(Validators.required);
      this.factureForm.get('pointVente')?.updateValueAndValidity();
      this.factureForm.get('fichier')?.addValidators(Validators.required);
      this.factureForm.get('fichier')?.updateValueAndValidity();

    }

  }

}
