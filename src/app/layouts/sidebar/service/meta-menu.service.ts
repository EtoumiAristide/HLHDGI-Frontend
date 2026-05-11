import { Injectable } from "@angular/core";
import { Observable, of, BehaviorSubject } from "rxjs";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";
import { MenuItem } from "../menu.model";
import { KeycloakService } from "keycloak-angular";
import { environment } from "src/environments/environment";
import { BkTimbreApiService } from "src/app/pages/bk/service/bk-timbre-api.service";
import { MENU } from "../menu";

@Injectable({
  providedIn: 'root'
})
export class MetaMenuService {

  private bkAuthorizedRoles: string[] = [];
  private bkRolesLoaded = false;
  private filteredMenuSubject = new BehaviorSubject<MenuItem[]>([]);

  constructor(
    private _crudService: ApiRequestService,
    private keycloak: KeycloakService,
    private bkService: BkTimbreApiService
  ) {
    // Emit initial filtered menu (without BK roles)
    this.emitFilteredMenu();
    this.loadBkRoles();
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

  private loadBkRoles(): void {
    if (this.bkRolesLoaded) return;

    this.bkService.getAuthorizedRoles().subscribe({
      next: response => {
        const roles = response?.data?.authorizedRoles || response?.authorizedRoles || [];
        this.bkAuthorizedRoles = Array.isArray(roles) ? roles : [];
        this.bkRolesLoaded = true;
        console.log('🔑 BK roles loaded from backend:', this.bkAuthorizedRoles);
        // Emit filtered menu after roles are loaded
        this.emitFilteredMenu();
      },
      error: error => {
        console.error('❌ Failed to load BK roles from backend:', error);
        // Fallback to default roles
        this.bkAuthorizedRoles = ['Compta-BK', 'Admin-BK'];
        this.bkRolesLoaded = true;
        this.emitFilteredMenu();
      }
    });
  }

  getBkAuthorizedRoles(): string[] {
    return this.bkAuthorizedRoles;
  }

  private emitFilteredMenu(): void {
    const filtered = this.filterMenu(MENU);
    this.filteredMenuSubject.next(filtered);
  }

  getFilteredMenuObservable(): Observable<MenuItem[]> {
    return this.filteredMenuSubject.asObservable();
  }

  private getUserRoles(): string[] {
    const token = this.keycloak.getKeycloakInstance().tokenParsed as any;

    // Essayer différentes sources de rôles dans le token Keycloak
    const realmRoles = token?.realm_access?.roles || [];
    const clientRoles = token?.resource_access?.[environment.keycloak.clientId]?.roles || [];
    const directRoles = token?.roles || [];

    // Combiner tous les rôles
    const allRoles = [...realmRoles, ...clientRoles, ...directRoles];

    console.log('🔍 User roles from token:', allRoles); // Debug log

    return allRoles;
  }

  filterMenu(menu: MenuItem[]): MenuItem[] {
    const userRoles = this.getUserRoles();

    console.log('📋 Filtering menu items. User roles:', userRoles);

    return menu
      .map(item => {
        // Dynamically update BK menu item roles only if user has BK roles
        if (item.label === 'BK - Droits de timbre' && this.bkRolesLoaded && this.bkAuthorizedRoles.length > 0) {
          return {
            ...item,
            roles: this.bkAuthorizedRoles
          };
        }
        return item;
      })
      .filter(item => {
        if (!item.roles || item.roles.length === 0) {
          console.log(`✅ Item "${item.label}" - No roles required`);
          return true;
        }

        const hasRequiredRole = item.roles.some(r => userRoles.some(ur => ur.toLowerCase() === r.toLowerCase()));
        console.log(`🔍 Item "${item.label}" - Required roles: ${item.roles.join(', ')} - Has access: ${hasRequiredRole}`);

        return hasRequiredRole;
      })
      .map(item => ({
        ...item,
        subItems: item.subItems ? this.filterMenu(item.subItems) : undefined
      }))
      .filter(item => !item.subItems || item.subItems.length > 0);
  }
}
