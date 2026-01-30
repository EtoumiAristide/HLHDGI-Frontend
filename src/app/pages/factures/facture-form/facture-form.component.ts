import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { methodePaiement, objectToFormData, typeClient, typeFacture } from 'src/app/core-custom/utils/utils.service';
import { PointVente } from '../../admin/pointvente/models/pointvente.model';
import { PointVenteService } from '../../admin/pointvente/services/pointvente.service';
import { Facture } from '../model/facture.model';
import { Payment } from '../model/payment.model';
import { FacturespiServices } from '../service/facture-api.service';


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

  factureAvoirForm!: FormArray
  // flag whether all avoirs are selected
  allAvoirsSelected: boolean = false
  // total refund amount computed from selected lines
  totalAvoir: number = 0

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
  isZinoFactureConsolide: boolean = false;

  paymentTypes = [
    { value: 'ALL', label: 'Tous les paiements' },
    { value: 'CASH', label: 'Espèces' },
    { value: 'BACKUP_CC', label: 'Backup CC' },
    { value: 'HD_GLOVO', label: 'HD Glovo' },
    { value: 'CASH_WAVE', label: 'Cash Wave' }
  ];

  urlFacture: string = ''
  montantFacture: number = 0
  reponseFNE: any = {}

  // userEtablissement: string = ''
  isOrderedByPaiementMethod: boolean = false
  isFacturationMultiple: boolean = false
  isAvoirFirstVersion: boolean = false

  modesFacturation = [
    { value: 'FACTURE_DETAILLE', label: 'Facture journalière' },
    { value: 'FACTURE_CONSOLIDE', label: 'Facture unifiée' },
  ]

  @ViewChild('templateModal') templateModal: TemplateRef<void>;

  constructor(
    private _factureApi: FacturespiServices,
    private _pointVenteApi: PointVenteService,
    //private _etablissementApi: EtablissementService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private _toastServive: ToastService,
    private _router: Router,
    //private _keycloakService: KeycloakService,
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
      messageCommercial: [''],
    })

    this.factureAvoirForm = this.fb.array([])

    // expose the FormArray on the main FormGroup so template using formArrayName finds it
    if (this.factureForm && this.factureForm instanceof FormGroup) {
      if (!this.factureForm.get('factureAvoirForm')) {
        this.factureForm.addControl('factureAvoirForm', this.factureAvoirForm)
      } else {
        this.factureForm.setControl('factureAvoirForm', this.factureAvoirForm)
      }
    }

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
        if (this.listePointVente.length != 0) {
          this.isOrderedByPaiementMethod = this.listePointVente[0].etablissement.organisation.isOrderedByPaiementMethod
          this.isFacturationMultiple = this.listePointVente[0].etablissement.organisation.isFacturationMultiple
        }

        if (this.isFacturationMultiple) {
          let modeFacturation: FormControl = new FormControl('', Validators.required)
          this.factureForm.addControl('modeFacturation', modeFacturation)
        }

        //this.chargerEtablissement()
      },
      error(err) {
        console.log(err);
      },
    })
  }

  /*chargerEtablissement() {
    // this._pointVenteApi.getAll().subscribe({

    this._etablissementApi.getAllByKeycloakGroup().subscribe({
      next: (response) => {
        console.log(response);

      },
      error(err) {
        console.log(err);

      },
    })
  }*/

  //Ajout d'un nouvel élément
  save() {
    if (this.factureForm.valid) {
      // console.log("Data form: " + JSON.stringify(this.factureForm.value));

      this.changeFormElement();

      let dataToSend: any = {}
      dataToSend.type = this.factureForm.controls['typeFacture'].value
      dataToSend.messageCommercial = this.factureForm.controls['messageCommercial'].value
      if (this.isFactureAvoir) {
        dataToSend.numeroFacture = this.factureForm.controls['numeroFacture'].value
        // collect selected lines (id, designation, quantite)
        const selectedLines: Array<any> = []
        for (let i = 0; i < this.factureAvoirForm.length; i++) {
          const grp = this.factureAvoirForm.at(i) as FormGroup
          if (grp.get('isSelected')?.value) {
            selectedLines.push({
              id: grp.get('itemId')?.value,
              designation: grp.get('description')?.value,
              quantite: Number(grp.get('quantite')?.value) || 0
            })
          }
        }
        dataToSend.selectedLines = selectedLines
      } else {

        dataToSend.file = this.factureForm.controls['fichier'].value
        dataToSend.client = this.factureForm.controls['typeClient'].value
        dataToSend.paiement = this.factureForm.controls['modePaiement'].value
        dataToSend.pointvente = this.listePointVente.find(pointVente => pointVente.id == this.factureForm.controls['pointVente'].value).nom
        if (this.isFacturationMultiple) {
          dataToSend.facturation = this.factureForm.controls['modeFacturation'].value
        }
      }
      console.log(dataToSend);

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

      this.changeFormElement(true);

      let dataToSend: any = {}
      dataToSend.type = this.factureForm.controls['typeFacture'].value
      dataToSend.messageCommercial = this.factureForm.controls['messageCommercial'].value
      dataToSend.file = this.factureForm.controls['fichier'].value
      if (this.isFactureAvoir) {
        dataToSend.numeroFacture = this.factureForm.controls['numeroFacture'].value
      } else {
        // dataToSend.file = this.factureForm.controls['fichier'].value
        dataToSend.client = this.factureForm.controls['typeClient'].value
        dataToSend.paiement = this.factureForm.controls['modePaiement'].value
        dataToSend.pointvente = this.factureForm.controls['pointVente'].value
        if (this.isFacturationMultiple) {
          dataToSend.facturation = this.factureForm.controls['modeFacturation'].value
        }
        // this.formData = objectToFormData(dataToSend)
      }
      this.formData = objectToFormData(dataToSend)


      let apiSend: Observable<Object> = this.isFactureAvoir ? this._factureApi.getByNumfne(this.factureForm.controls['numeroFacture'].value, this.formData) : this._factureApi.loadFromFile(this.formData)

      apiSend.subscribe({
        next: (response: any) => {
          // console.log(response);

          if (this.isFactureAvoir) {
            this.isFactureAvoirLoad = true;
            this.isLoadFacture = false
            if (response.data && response.data.factureVente.reponseFNE) {
              // this.reponseFNE = JSON.parse(response.data.reponseFNE)
              this.reponseFNE = JSON.parse(response.data.factureVente.reponseFNE)
              this.urlFacture = this.reponseFNE.token;

              const dataFactures = response.data.donneesExtraite
              // console.log(dataFactures);

              // console.log(JSON.stringify(this.reponseFNE));
              this.montantFacture = this.reponseFNE.invoice.totalDue
              if (dataFactures && dataFactures.length > 0) {
                this.setFactureAvoirForm(this.reponseFNE.invoice.items, dataFactures);
              }
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

          this._toastServive.success(" Données de facture extraites avec succès", "Extraction éffectuée").onHidden.subscribe(() => {
            this.initFormElement();
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

  setFactureAvoirForm(items: any[], donneesExtraites?: any[]) {
    // Constitution du formulaire
    this.factureAvoirForm = this.fb.array([])
    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      // build validators safely (item.quantity may be null/undefined)
      const quantValidators: any[] = [Validators.required]
      if (item && typeof item.quantity === 'number') {
        quantValidators.push(Validators.max(item.quantity))
      }
      const grp = this.fb.group({
        itemId: [item.id],
        description: [item.description],
        quantite: [item.quantity, Validators.compose(quantValidators)],
        montant: [item.amount],
        isSelected: [false],
      })

      // disable quantity by default until the line is selected
      grp.get('quantite')?.disable({ emitEvent: false })

      // recompute total when quantity changes
      grp.get('quantite')?.valueChanges.subscribe(() => {
        this.computeTotalAvoir()
      })

      // when isSelected changes, enable/disable quantity and recompute total
      grp.get('isSelected')?.valueChanges.subscribe((checked: boolean) => {
        if (checked) {
          grp.get('quantite')?.enable({ emitEvent: false })
        } else {
          grp.get('quantite')?.disable({ emitEvent: false })
        }
        this.computeTotalAvoir()
        this.updateAllSelectedFlag()
      })

      this.factureAvoirForm.push(grp)
    }

    // If extracted data provided, try to map them to the generated form groups
    if (donneesExtraites && Array.isArray(donneesExtraites) && donneesExtraites.length > 0) {
      // Support two formats for donneesExtraites:
      // 1) array of lignes [{produit, quantite, ...}, ...]
      // 2) array of factures [{ lignes: [...] }, ...]
      const lignesToMatch: any[] = []
      if (donneesExtraites[0] && Array.isArray(donneesExtraites[0].lignes)) {
        for (const facture of donneesExtraites) {
          if (facture && Array.isArray(facture.lignes)) {
            lignesToMatch.push(...facture.lignes)
          }
        }
      } else {
        lignesToMatch.push(...donneesExtraites)
      }

      if (lignesToMatch.length === 0) {
        this._toastServive.error('Aucune ligne trouvée dans les données extraites.', 'Erreur de correspondance')
        this.disableAllAvoirCheckboxes()
        return
      }

      try {
        for (const ext of lignesToMatch) {
          const prodName = (ext.produit || '').toString().trim().toLowerCase()
          const qty = Number(ext.quantite) || 0

          let matched = false
          for (let i = 0; i < this.factureAvoirForm.length; i++) {
            const ctrl = this.factureAvoirForm.at(i) as FormGroup
            const desc = (ctrl.get('description')?.value || '').toString().trim().toLowerCase()
            const existingQty = Number(ctrl.get('quantite')?.value) || 0

            if (desc === prodName) {
              matched = true
              if (qty > existingQty) {
                this._toastServive.error(
                  'La quantité demandée pour "' + (ext.produit || prodName) + '" est supérieure à la quantité disponible.',
                  'Erreur de correspondance'
                )
                this.disableAllAvoirCheckboxes()
                return
              }

              // Set the quantity to the extracted value and make it read-only (disabled)
              ctrl.get('quantite')?.setValue(qty, { emitEvent: false })
              ctrl.get('quantite')?.disable({ emitEvent: false })
              // ensure validators are up-to-date
              ctrl.get('quantite')?.updateValueAndValidity({ onlySelf: true, emitEvent: false })
              // mark selected and lock the checkbox so user can't change it
              ctrl.get('isSelected')?.setValue(true, { emitEvent: false })
              ctrl.get('isSelected')?.disable({ emitEvent: false })
              break
            }
          }

          if (!matched) {
            this._toastServive.error(
              'Aucun article correspondant trouvé pour "' + (ext.produit || '') + '". Vérifiez le nom du produit.',
              'Erreur de correspondance'
            )
            this.disableAllAvoirCheckboxes()
            return
          }
        }

        // Disable all non-matched lines (ensure only matched are selectable) and compute totals
        for (let i = 0; i < this.factureAvoirForm.length; i++) {
          const ctrl = this.factureAvoirForm.at(i) as FormGroup
          if (!ctrl.get('isSelected')?.value) {
            ctrl.get('isSelected')?.setValue(false, { emitEvent: false })
            // disable the checkbox control so user can't select unmatched lines
            ctrl.get('isSelected')?.disable({ emitEvent: false })
            ctrl.get('quantite')?.disable({ emitEvent: false })
          }
        }

        this.updateAllSelectedFlag()
        this.computeTotalAvoir()

        // Ensure all checkboxes are disabled so user can't change selection after matching
        for (let i = 0; i < this.factureAvoirForm.length; i++) {
          const ctrl = this.factureAvoirForm.at(i) as FormGroup
          const isSel = ctrl.get('isSelected')
          if (isSel) {
            isSel.disable({ emitEvent: false })
          }
        }

        this._toastServive.success('Correspondances appliquées. Les lignes correspondantes ont été sélectionnées.', 'Succès')
      } catch (err) {
        console.error('Erreur lors de l\'application des correspondances', err)
        this.disableAllAvoirCheckboxes()
        this._toastServive.error('Erreur interne lors du traitement des correspondances.', 'Erreur')
      }
    }
  }

  // Disable all isSelected checkboxes and quantities (used when correspondence attempt finishes)
  private disableAllAvoirCheckboxes(): void {
    if (!this.factureAvoirForm) return
    for (let i = 0; i < this.factureAvoirForm.length; i++) {
      const ctrl = this.factureAvoirForm.at(i) as FormGroup
      const isSel = ctrl.get('isSelected')
      if (isSel) {
        isSel.disable({ emitEvent: false })
      }
      const quant = ctrl.get('quantite')
      if (quant) {
        quant.disable({ emitEvent: false })
      }
    }
    this.updateAllSelectedFlag()
    this.computeTotalAvoir()
  }

  toggleAvoir(index: number, checked: boolean) {
    const ctrl = this.factureAvoirForm.at(index) as FormGroup
    ctrl.get('isSelected')?.setValue(checked)
    if (checked) {
      ctrl.get('quantite')?.enable({ emitEvent: false })
    } else {
      ctrl.get('quantite')?.disable({ emitEvent: false })
    }
    this.computeTotalAvoir()
    this.updateAllSelectedFlag()
  }

  selectAllAvoir(selectAll: boolean) {
    for (let i = 0; i < this.factureAvoirForm.length; i++) {
      const ctrl = this.factureAvoirForm.at(i) as FormGroup
      ctrl.get('isSelected')?.setValue(selectAll)
      if (selectAll) {
        ctrl.get('quantite')?.enable({ emitEvent: false })
      } else {
        ctrl.get('quantite')?.disable({ emitEvent: false })
      }
    }
    this.computeTotalAvoir()
    this.allAvoirsSelected = selectAll
  }

  toggleSelectAll() {
    this.selectAllAvoir(!this.allAvoirsSelected)
  }

  updateAllSelectedFlag() {
    this.allAvoirsSelected = this.factureAvoirForm.length > 0 && this.factureAvoirForm.controls.every((c: any) => c.get('isSelected')?.value === true)
  }

  computeTotalAvoir(): number {
    let total = 0
    for (let i = 0; i < this.factureAvoirForm.length; i++) {
      const ctrl = this.factureAvoirForm.at(i) as FormGroup
      if (ctrl.get('isSelected')?.value) {
        const q = Number(ctrl.get('quantite')?.value) || 0
        const m = Number(ctrl.get('montant')?.value) || 0
        total += q * m
      }
    }
    this.totalAvoir = total
    return total
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      // console.log(file);

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
    // console.log(selectedType);

    if (selectedType === 'FACTURE_AVOIR') {
      this.isFactureAvoir = true;

      // this.factureForm.get('modePaiement')?.clearValidators();
      this.factureForm.get('typeClient')?.clearValidators();
      this.factureForm.get('typeClient')?.updateValueAndValidity();
      this.factureForm.get('pointVente')?.clearValidators();
      this.factureForm.get('pointVente')?.updateValueAndValidity();
      if (this.isAvoirFirstVersion) {
        this.factureForm.get('fichier')?.clearValidators();
        this.factureForm.get('fichier')?.updateValueAndValidity();
      }
      //this.factureForm.get('fichier')?.clearValidators();
      //this.factureForm.get('fichier')?.updateValueAndValidity();

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
      //this.factureForm.get('fichier')?.addValidators(Validators.required);
      //this.factureForm.get('fichier')?.updateValueAndValidity();

    }

    this.isAvoirFirstVersion = this.listePointVente[0].etablissement.organisation.isAvoirFirstVersion && this.isFactureAvoir

  }
  selectionModeFacturation() {
    const selectedType = this.factureForm.get('modeFacturation')?.value;
    console.log(selectedType);

    selectedType === 'FACTURE_CONSOLIDE' ? this.isZinoFactureConsolide = true : this.isZinoFactureConsolide = false;

  }
}
