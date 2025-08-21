import { Component, OnInit, TemplateRef } from '@angular/core';
import { UserKeycloakService } from '../services/userkeycloak.service';
import { Router } from '@angular/router';
import { Utilisateur } from '../../organisation/models/utilisateur.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';

@Component({
  selector: 'app-liste-utilisateur',
  templateUrl: './liste-utilisateur.component.html',
  styleUrls: ['./liste-utilisateur.component.css']
})
export class ListeUtilisateurComponent implements OnInit {

  userList: Utilisateur[] = []
  userListFilter: Utilisateur[] = []

  userDtoForm: Utilisateur

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

  newPassword: string = ''


  // bread crumb items
  breadCrumbItems: Array<{}>;

  constructor(
    private _userKeycloakService: UserKeycloakService,
    private _toastServive: ToastService,
    private _modalService: BsModalService,
    private _router: Router
  ) {

  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Gestion des utilisateurs' }, { label: 'Listes', active: true }];

    this.listeUser()
  }

  openForm(isModif: boolean = false, id: string = '') {
    if (isModif) {
      this._router.navigate(['utilisateurs/form', id])
    } else {
      this._router.navigate(['utilisateurs/form'])
    }
  }

  listeUser() {
    this._userKeycloakService.listUser().subscribe({
      next: (response) => {
        this.userList = response
        this.userListFilter = response
        // console.log(this.userList);
      },
      error: (err) => {
        console.log(err);
      },
    })
  }

  reinitPassword() {
    //Changement de l'apparence du bouton
    this.changeFormElement();

    this._userKeycloakService.reinitPassword(this.userDtoForm.id, this.newPassword).subscribe({
      next: response => {
        // console.log("Data receive: " + response);

        this._modalService.hide();
        this._toastServive.success("Mot de passe rénitialisé avec succès", "Réinitialisation éffectuée").onHidden.subscribe(() => {
          this.listeUser();
          this.initFormElement(true);

        })
      },
      error: error => {
        console.error("There is an error !", error);
        this._modalService.hide();
        this._toastServive.error("Une erreur est survenue", "Réinitialisation échouée").onHidden.subscribe(() => {
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
      //this.cleanFormData();
      // this._modalService.hide();
      this.txtModalHeader = formModalHeader.save;
    }
  }

  //Ouvre le formulaire en modal pour la création, la mise à jour ou la suppression
  openModal(template: TemplateRef<void>, userToUpdate: Utilisateur) {
    //console.log(periodeToUpdate);
    this.userDtoForm = userToUpdate
    this.textButton = btnFormState.reinit;

    this.txtModalHeader = formModalHeader.reinit + " du mot de passe";
    //this.cleanFormData()

    this.modalRef = this._modalService.show(template, this.config)
  }

  filterData(event: any) {
    let value = event.value.toLowerCase().trim();
    //console.log(this.organisationListFilter.length)
    this.userList = value.length != 0 ?
      this.userList.filter(user => (user.firstName != null && user.firstName.toLowerCase().trim().includes(value))
        || (user.lastName != null && user.lastName.toLowerCase().trim().includes(value))
        || (user.email != null && user.email.toLowerCase().trim().includes(value))
        || (user.username != null && user.username.toLowerCase().trim().includes(value))
        || (user.organisation != null && user.organisation.code.toLowerCase().trim().includes(value))
        || (user.organisation != null && user.organisation.raisonSocial.toLowerCase().trim().includes(value))
      ) :
      this.userListFilter;
  }
}
