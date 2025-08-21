import { Injectable } from "@angular/core";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";
import { Utilisateur } from "../../organisation/models/utilisateur.model";

@Injectable({
  providedIn: 'root'
})
export class UserKeycloakService {
  constructor(private _crudService: ApiRequestService) {
  }

  createUser(userKeycloak: Utilisateur) {
    return this._crudService.post({endpoint:url_path.UTILISATEUR_EP, data:JSON.stringify(userKeycloak)})
  }
  updateUser(userKeycloak: Utilisateur) {
    return this._crudService.put({endpoint:url_path.UTILISATEUR_EP + '/' + userKeycloak.id, data:JSON.stringify(userKeycloak)})
  }
  reinitPassword(userId: string, password: string) {
    return this._crudService.getById(url_path.UTILISATEUR_EP + '/' + userId + '/' + password)
  }

  listRole() {
    return this._crudService.getAll(url_path.UTILISATEUR_EP + '/roles-frontend-client')
  }

  listUser() {
    return this._crudService.getAll(url_path.UTILISATEUR_EP)
  }

  getUserByLogin(username: string) {
    return this._crudService.getById(url_path.UTILISATEUR_EP + '/getByUsername/' + username)
  }

  getUserById(userId: string) {
    return this._crudService.getById(url_path.UTILISATEUR_EP + '/getById/' + userId)
  }
}
