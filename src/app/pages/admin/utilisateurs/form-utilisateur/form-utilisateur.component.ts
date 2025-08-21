import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganisationService } from '../../organisation/services/organisation.service';
import { UserKeycloakService } from '../services/userkeycloak.service';
import { Organisation } from '../../organisation/models/organisation.model';
import { FormControl, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { RoleDto } from '../models/role-frontend.model';
import { Utilisateur } from '../../organisation/models/utilisateur.model';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';

@Component({
  selector: 'app-form-utilisateur',
  templateUrl: './form-utilisateur.component.html',
  styleUrls: ['./form-utilisateur.component.css']
})
export class FormUtilisateurComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  loadingBtn: boolean = false;
  textButton: string = btnFormState.save;
  txtModalHeader = formModalHeader.save;

  isModif: boolean = false;

  idToUpdate: string = '';
  private sub?: any;

  organisations: Organisation[]
  roles: RoleDto[]

  userDtoForm: Utilisateur

  errorMsg: string = ''
  showErrorPanel: boolean = false;

  constructor(
    private _userKeycloakService: UserKeycloakService,
    private _toastServive: ToastService,
    private route: ActivatedRoute,
    private _router: Router,
    private _organisationApi: OrganisationService,
  ) {
    this.cleanFormData();
  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Gestion des utilisateurs' }, { label: 'forms', active: true }];

    this.getOrganisation()
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  openViewList() {
    this._router.navigate(['/utilisateurs'])
  }

  initUpdateData() {
    this.sub = this.route.params.subscribe(params => {
      // console.log(params);

      this.idToUpdate = params['id'] != undefined ? params['id'] : '';
      // console.log(this.idToUpdate);

      if (this.idToUpdate != '') {
        this.getUtilisateurData(this.idToUpdate)
      }
    });
  }

  getOrganisation() {
    this._organisationApi.getAll().subscribe({
      next: (response) => {
        //console.log(response);

        this.organisations = response

        this.getRoles()
      },
      error: (err) => {
        console.log(err);
      },
    })
  }

  getRoles() {
    this._userKeycloakService.listRole().subscribe({
      next: (response) => {
        // console.log(response);
        this.roles = response

        this.initUpdateData()
      },
      error: (err) => {
        console.log(err);

      },
    })
  }

  getUtilisateurData(userId: string) {
    this._userKeycloakService.getUserById(userId).subscribe({
      next: (response) => {
        this.userDtoForm = response as Utilisateur
        // console.log(this.userDtoForm);

        this.isModif = true;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  save(addUtilisateurForm: NgForm) {
    if (addUtilisateurForm.valid) {
      // console.log("Data send: " + JSON.stringify(this.userDtoForm));
      //Changement de l'apparance du bouton
      this.showErrorPanel = false
      this.changeFormElement();

      let apiSend: Observable<any> = this.userDtoForm.id == '' ? this._userKeycloakService.createUser(this.userDtoForm) : this._userKeycloakService.updateUser(this.userDtoForm);

      apiSend.subscribe({
        next: response => {
          // console.log("Data receive: " + JSON.stringify(response));
          
          if (response.status) {
            this._toastServive.success("Agent enregistré avec succès", "Enregistrement éffectué").onHidden.subscribe(() => {
              this.initFormElement(!this.isModif);
              this.openViewList()
            })
          } else {
            this._toastServive.error("Une erreur est survenue", "Enregistrement échoué").onHidden.subscribe(() => {
              this.initFormElement();
              this.errorMsg = response.message + ' : ' + response.content
              this.showErrorPanel = true
            });
          }
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
      // this._modalService.hide();
      this.txtModalHeader = formModalHeader.save;
    }
  }

  //Réinitialisation des données du formulaire
  cleanFormData() {
    this.userDtoForm = {
      id: '',
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      enable: true,
      organisation: {
        id: 0,
      }
    }
  }

  controlSelection(selectInput: FormControl): boolean {
    return selectInput.value == 0 || selectInput.value == '';
  }


}
