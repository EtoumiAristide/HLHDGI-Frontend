import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CrudService } from "src/app/core/services/crud.service";
import { PermissionPayload } from "../models/permission.model";
import { url_path } from "src/app/core-custom/constants/app.constant";

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private _crudService: CrudService) {
  }

  save(permissions: PermissionPayload[]): Observable<any> {
    return this._crudService.addData(url_path.PERMISSION_EP, permissions)
  }

  delete(id: number): Observable<void> {
    return this._crudService.deleteData(url_path.PERMISSION_EP + '/' + id)
  }


}
