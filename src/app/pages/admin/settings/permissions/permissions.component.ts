import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'src/app/layouts/sidebar/menu.model';
import { MetaMenuService } from 'src/app/layouts/sidebar/service/meta-menu.service';
import { RoleDto } from '../../utilisateurs/models/role-frontend.model';
import { UserKeycloakService } from '../../utilisateurs/services/userkeycloak.service';
import { MenuData, Permission, PermissionPayload } from './models/permission.model';
import { PermissionService } from './services/permission.service';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  menus: MenuItem[] = []
  rolesMenu: MenuItem[] = []
  roles: RoleDto[]

  permissionForm: Permission

  loadingBtn: boolean = false;
  textButton: string = btnFormState.save;

  constructor(
    private _toastServive: ToastService,
    private _metaMenuService: MetaMenuService,
    private _userKeycloakService: UserKeycloakService,
    private _permissionService: PermissionService,
    private _router: Router
  ) {
    this.initObjet()
  }

  initObjet() {
    this.permissionForm = {
      role: '',
      menus: []
    }
  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Gestion des Permissions' }, { label: 'Listes', active: true }];
    this.getAllMenu()

    this.getRoles()
  }

  getAllMenu() {
    this._metaMenuService.getAll().subscribe({
      next: (value) => {
        // console.log(value);

        this.menus = value as MenuItem[]

        this.menus.forEach(item => {
          let menuItem: MenuData = {
            id: item.id,
            libelle: item.label,
            isActive: false
          }
          this.permissionForm.menus.push(menuItem)
        })

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

      },
      error: (err) => {
        console.log(err);

      },
    })
  }

  getMenuByRoles() {
    this.rolesMenu = []
    this.selectionBtnReinit()
    this._metaMenuService.getByRole(this.permissionForm.role).subscribe({
      next: (response) => {
        this.rolesMenu = response as MenuItem[]
        //console.log(this.rolesMenu);
        this.setGroupePermission()
      },
      error: (err) => {
        console.log(err);

      },
    })
  }

  setGroupePermission() {

    this.rolesMenu.forEach(roleMenu => {
      for (let index = 0; index < this.permissionForm.menus.length; index++) {
        const element = this.permissionForm.menus[index];

        if (roleMenu.label == element.libelle) {
          this.permissionForm.menus[index].isActive = true

          break
        }
      }
    })
  }

  selectionBtnReinit() {
    //Réinitialisation des boutons de sélection
    this.permissionForm.menus.forEach(item => {
      item.isActive = false
    })
  }

  changeFormElement() {
    this.loadingBtn = true;
    this.textButton = btnFormState.processing
  }

  //Réinitialisation des composants du formulaire
  initFormElement() {
    this.textButton = btnFormState.save
    this.loadingBtn = false;

  }

  save(addPermissionForm: NgForm) {
    if (addPermissionForm.valid) {
      // console.log("Data send: " + JSON.stringify(this.permissionForm));

      //Changement de l'apparence du bouton
      this.changeFormElement()

      let permissions: PermissionPayload[] = []
      this.permissionForm.menus.forEach(data => {
        if (data.isActive) {
          let permissionData: PermissionPayload = {
            roleName: this.permissionForm.role,
            menu: {
              id: data.id
            }
          }
          permissions.push(permissionData)
        }
      })

      // console.log("Data send: " + JSON.stringify(permissions));
      this._permissionService.save(permissions).subscribe({
        next: response => {
          // console.log(response);

          this._toastServive.success("Période enregistrée avec succès", "Enregistrement éffectué").onHidden.subscribe(() => {
            this.initFormElement()
          })
        },
        error: err => {
          console.log(err);

          this._toastServive.error("Une erreur est survenue", "Suppression échouée").onHidden.subscribe(() => {
            this.initFormElement()
          })
        },
      })
    }
  }
}
