import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { Facture } from '../model/facture.model';
import { FacturespiServices } from '../service/facture-api.service';
import { Router } from '@angular/router';

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
  factureListeSearch: Facture[]

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
    private _factureApi: FacturespiServices,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private _toastServive: ToastService,
    private _router: Router,
  ) {

    this.facture = new Facture()

    this.factureForm = this.fb.group({
      id: [0, Validators.required],
      numFacture: ['', Validators.required],
      dateFacture: ['', Validators.required],
      nomClient: ['', Validators.required],
      typeFacture: ['', Validators.required],
    })

    this.isModif = false
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Accueil' }, { label: 'Factures', active: true }];
  }

  openForm() {
    this._router.navigate(['factures'])
  }

  // filter job
  search() {
    
  }

}
