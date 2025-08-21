import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";
import { MenuItem } from "../menu.model";

@Injectable({
  providedIn: 'root'
})
export class MetaMenuService {

  constructor(private _crudService: ApiRequestService) {
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
}
