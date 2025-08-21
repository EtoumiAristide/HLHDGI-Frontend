import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { btnFormState } from 'src/app/core-custom/constants/form-btn-state.constant';
import { formModalHeader } from 'src/app/core-custom/constants/form-modal-header.constant';
import { ToastService } from 'src/app/core-custom/services/toast.service';
import { MenuItem } from 'src/app/layouts/sidebar/menu.model';
import { MetaMenuService } from 'src/app/layouts/sidebar/service/meta-menu.service';
import { ApiPaginatedResponse } from 'src/app/shared/model/api-response.model';

@Component({
  selector: 'app-metamenu',
  templateUrl: './metamenu.component.html',
  styleUrls: ['./metamenu.component.css']
})
export class MetamenuComponent implements OnInit {

  breadCrumbItems: Array<{}>;

  menus: MenuItem[]

  menusFilter: MenuItem[] = [];
  metaMenuForm: MenuItem;

  loadingBtn: boolean = false;
  textButton: string = btnFormState.save;
  txtModalHeader = formModalHeader.save;

  modalRef?: BsModalRef;
  //Empeche le modal de se fermer sans avoir cliquer sur le bouton de fermeture
  config = {
    backdrop: true,
    ignoreBackdropClick: true
  };


  constructor(
    private _metaMenuService: MetaMenuService,
    private _toastServive: ToastService,
    private _modalService: BsModalService
  ) {
    this.cleanFormData();

  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Gestion des menus' }, { label: 'Menus', active: true }];

    this.getAllMenu()
  }

  getAllMenu() {
    this._metaMenuService.getAll().subscribe({
      next: (value) => {
        // console.log(value);

        this.menus = value as MenuItem[]
        this.menusFilter = this.menus
        this.menus.forEach(item => {
          for (const menuItem of this.menus) {
            if (item.parentId == menuItem.id) {
              item.parentLabel = menuItem.label
              break
            }
          }
        })

      },
      error: (err) => {
        console.log(err);

      },
    })
  }

  save(addMenuItemForm: NgForm) {
    if (addMenuItemForm.valid) {
      // console.log("Data send: " + JSON.stringify(this.metaMenuForm));

      //Changement de l'apparance du bouton
      this.changeFormElement();

      let apiSend: Observable<MenuItem> = this.metaMenuForm.id == 0 ? this._metaMenuService.save(this.metaMenuForm) : this._metaMenuService.update(this.metaMenuForm);

      apiSend.subscribe({
        next: response => {
          // console.log("Data receive: " + response.toString());

          this._modalService.hide();
          this._toastServive.success("Menu enregistré avec succès", "Enregistrement éffectué").onHidden.subscribe(() => {
            this.getAllMenu();
            this.initFormElement(true);

          })
        },
        error: error => {
          console.error("There is an error !", error);
          this._modalService.hide();
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

    this._metaMenuService.delete(this.metaMenuForm.id).subscribe({
      next: response => {
        // console.log("Data receive: " + response);

        this._modalService.hide();
        this._toastServive.success("Menu supprimée avec succès", "Suppression éffectuée").onHidden.subscribe(() => {
          this.getAllMenu();
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
      // this._modalService.hide();
      this.txtModalHeader = formModalHeader.save;
    }
  }

  //Ouvre le formulaire en modal pour la création, la mise à jour ou la suppression
  openModal(template: TemplateRef<void>, metaMenuToUpdate?: MenuItem, isDelete: boolean = false) {
    //console.log(metaMenuToUpdate);
    this.textButton = btnFormState.save;
    if (metaMenuToUpdate != undefined && !isDelete) {
      this.metaMenuForm = metaMenuToUpdate;
      this.txtModalHeader = formModalHeader.update + " d'une catégorie";
    } else if (metaMenuToUpdate != undefined && isDelete) {
      this.metaMenuForm = metaMenuToUpdate;
      this.textButton = btnFormState.delete;
      this.txtModalHeader = formModalHeader.delete;
    } else {
      this.txtModalHeader = formModalHeader.save + " d'une catégorie";
      this.cleanFormData()
    }

    this.modalRef = this._modalService.show(template, this.config)
  }

  //Réinitialisation des données du formulaire
  cleanFormData() {
    this.metaMenuForm = {
      id: 0,
      label: '',
      icon: '',
      link: '',
      subItems: '',
      isTitle: false,
      badge: '',
      parentId: 0,
      parentLabel: '',
      isLayout: false
    }
  }

  filterData(event: any) {
    let value = event.value.toLowerCase().trim();
    //console.log(this.metaMenuListFilter.length)
    this.menus = value.length != 0 ?
      this.menus.filter(metaMenu => (metaMenu.label != null && metaMenu.label.toLowerCase().trim().includes(value))
        || (metaMenu.parentLabel != null && metaMenu.parentLabel.toLowerCase().trim().includes(value))
      ) :
      this.menusFilter;
  }

  controlSelection(selectInput: NgModel): boolean {
    return selectInput.control.value == 0;
  }
}
