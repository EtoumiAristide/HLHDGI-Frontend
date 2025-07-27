import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { Partenaire } from './model/patenaire.model';
import { PartenaireApiServices } from './service/partenaire-api.service';

@Component({
  selector: 'app-partenaires',
  templateUrl: './partenaires.component.html',
  styleUrls: ['./partenaires.component.css']
})
export class PartenairesComponent {

  pageTitle: string = "Partenaire"

  pageChanged($event: any) {
    throw new Error('Method not implemented.');
  }
  // bread crum data
  breadCrumbItems: Array<{}>;

  term: any
  partenairteList: Partenaire[] = []
  // Table data
  total: Observable<number>;
  partenaireForm!: FormGroup;
  partenaire: Partenaire

  deleteId: any;
  partenaireListeSearch: Partenaire[]

  modalRef?: BsModalRef;
  config: any = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'modal-lg modal-dialog-centered'
  };

  //COnfiguration du bouton lors de la validation
  loadingBtn: boolean = false;
  textButton: string = btnFormState.save;
  txtModalHeader = formModalHeader.save

  isModif: boolean;
  isView: boolean;

  apiCallError: any

  constructor(
    private _partenaireApi: PartenaireApiServices,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private _toastServive: ToastService,
  ) {

    this.partenaire = new Partenaire()

    this.partenaireForm = this.fb.group({
      nomPartenaire: ['', Validators.required],
      login: ['', Validators.required],
      user: ['', Validators.required],
      userId: ['', Validators.required],
      pincode: ['', Validators.required],
      serialNo: ['', Validators.required],
      password: ['', Validators.required],
      vtype: ['', Validators.required],
      vcode: ['', Validators.required],
      deviceNo: ['', Validators.required],
      groupid: ['', Validators.required]
    })

    this.isModif = false
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Accueil' }, { label: 'Partenaires', active: true }];
    this.chargerListePartenaire()
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any, dataToUpdate: Partenaire, isModif: boolean = false, isView: boolean = false, isDelete: boolean = false) {

    this.clearForm()

    if (isModif || isView) {
      this.partenaire = dataToUpdate
      this.mapObjectToForm()
    }
    this.txtModalHeader = isModif ? formModalHeader.update + ' ' + this.pageTitle : isView ? formModalHeader.show + ' ' + this.pageTitle : isDelete ? formModalHeader.delete + ' ' + this.pageTitle : formModalHeader.save + ' ' + this.pageTitle;
    if (isDelete) {
      this.partenaire = dataToUpdate
      this.config.class = "modal-md modal-dialog-centered"
    }
    this.isModif = isModif
    this.isView = isView

    this.modalRef = this.modalService.show(content, this.config);
  }

  chargerListePartenaire() {
    this._partenaireApi.getAll().subscribe({
      next: (response) => {
        // console.log(response);

        this.partenairteList = response.data
        this.partenaireListeSearch = response.data
      },
      error(err) {
        console.log(err);

      },
    })
  }

  // filter job
  search() {
    if (this.term) {
      this.partenairteList = this.partenaireListeSearch.filter((data: any) => {
        return data.partenaire.toLowerCase().includes(this.term.toLowerCase())
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
      this.partenairteList = this.partenaireListeSearch
    }
  }

  //Ajout d'un nouvel élément
  save() {
    if (this.partenaireForm.valid) {
      console.log("Data form: " + JSON.stringify(this.partenaireForm.value));

      this.changeFormElement();

      this.mapFormToObject()

      let apiSend: Observable<Object> = !this.isModif ? this._partenaireApi.save(this.partenaire) : this._partenaireApi.update(this.partenaire.login, this.partenaire);

      apiSend.subscribe({
        next: response => {

          this._toastServive.success(this.pageTitle + " enregistré avec succès", "Enregistrement éffectué").onHidden.subscribe(() => {
            this.chargerListePartenaire();
            this.initFormElement(true);

          })
        },
        error: error => {
          console.error("There is an error !", error);
          this._toastServive.error("Une erreur est survenue", "Enregistrement échoué").onHidden.subscribe(() => {
            this.initFormElement();
            this.apiCallError = error.error.data
          });
        }
      });
    }
  }

  //Suppression d'un élément
  delete() {
    //Changement de l'apparance du bouton
    this.changeFormElement();

    this._partenaireApi.delete(this.partenaire.login).subscribe({
      next: response => {
        // console.log("Data receive: " + response);

        this._toastServive.success(this.pageTitle + " supprimé avec succès", "Suppression éffectuée").onHidden.subscribe(() => {
          this.chargerListePartenaire();
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

  //Modification de l'apparence visuelle du bouton "Valider"
  changeFormElement() {
    this.loadingBtn = true;
    this.textButton = btnFormState.processing
  }

  //Remise à l'état initial du bouton "Valider" et des données du formulaire
  initFormElement(isReinitData: boolean = false) {
    this.textButton = btnFormState.save
    this.loadingBtn = false;
    this.apiCallError = undefined

    if (isReinitData) {
      this.clearForm()
      this.modalService.hide(this.modalRef?.id);
      this.txtModalHeader = formModalHeader.save + ' ' + this.pageTitle;
    }
  }

  mapFormToObject() {
    this.partenaire.login = this.partenaireForm.controls['login'].value
    this.partenaire.user = this.partenaireForm.controls['user'].value
    this.partenaire.userid = this.partenaireForm.controls['userId'].value
    this.partenaire.pincode = this.partenaireForm.controls['pincode'].value
    this.partenaire.serialno = this.partenaireForm.controls['serialNo'].value
    this.partenaire.password = this.partenaireForm.controls['password'].value
    this.partenaire.vtype = this.partenaireForm.controls['vtype'].value
    this.partenaire.vcode = this.partenaireForm.controls['vcode'].value
    this.partenaire.deviceno = this.partenaireForm.controls['deviceNo'].value
    this.partenaire.groupid = this.partenaireForm.controls['groupid'].value
    this.partenaire.partenaire = this.partenaireForm.controls['nomPartenaire'].value
  }

  // Mise à jour des champs du formulaire
  mapObjectToForm() {
    this.partenaireForm.patchValue({
      nomPartenaire: this.partenaire.partenaire,
      login: this.partenaire.login,
      user: this.partenaire.user,
      userId: this.partenaire.userid,
      pincode: this.partenaire.pincode,
      serialNo: this.partenaire.serialno,
      password: this.partenaire.password,
      vtype: this.partenaire.vtype,
      vcode: this.partenaire.vcode,
      deviceNo: this.partenaire.deviceno,
      groupid: this.partenaire.groupid
    })
  }

  clearForm() {
    this.partenaire = new Partenaire()
    this.partenaireForm.reset()
  }


} 
