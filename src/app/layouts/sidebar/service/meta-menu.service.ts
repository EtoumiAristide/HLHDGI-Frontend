import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";
import { MenuItem } from "../menu.model";
import { KeycloakService } from "keycloak-angular";

@Injectable({
  providedIn: 'root'
})
export class MetaMenuService {

  constructor(private _crudService: ApiRequestService, private keycloak: KeycloakService) {
  }

  getMenus(): Observable<MenuItem[]> {
    return this._crudService.getAll(`${url_path.MENU_EP}/users`)
  }

  getAll() {
    return this._crudService.getAll(url_path.MENU_EP)
  }

  getByRole(rolename: string) {
    return this._crudService.getAll(url_path.MENU_EP + "/getByRole/" + rolename)
  }

  save(metaMenu: MenuItem): Observable<MenuItem> {
    return this._crudService.post({endpoint:url_path.MENU_EP, data: JSON.stringify(metaMenu)})
  }

  update(metaMenu: MenuItem): Observable<MenuItem> {
    return this._crudService.put({endpoint:url_path.MENU_EP + '/' + metaMenu.id, data:JSON.stringify(metaMenu)})
  }

  delete(id: number): Observable<void> {
    return this._crudService.delete(url_path.MENU_EP + '/' + id)
  }

  private getUserRoles(): string[] {
    const token = this.keycloak.getKeycloakInstance().tokenParsed as any;
    return token?.roles || [];
  }

  filterMenu(menu: MenuItem[]): MenuItem[] {
    const userRoles = this.getUserRoles();

    return menu
      .filter(item =>
        !item.roles || item.roles.some(r => userRoles.includes(r))
      )
      .map(item => ({
        ...item,
        subItems: item.subItems ? this.filterMenu(item.subItems) : undefined
      }))
      .filter(item => !item.subItems || item.subItems.length > 0);
  }
}
