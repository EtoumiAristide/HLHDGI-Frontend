import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BkTimbreApiService } from 'src/app/pages/bk/service/bk-timbre-api.service';

@Injectable({
  providedIn: 'root'
})
export class BkAuthGuard implements CanActivate {
  constructor(
    private bkService: BkTimbreApiService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.bkService.getAuthorizedRoles().pipe(
      map(response => {
        const roles = response?.data?.authorizedRoles || response?.authorizedRoles || [];
        const authorizedRoles = Array.isArray(roles) ? roles : [];

        if (authorizedRoles.length > 0) {
          console.log('✅ BK Access granted:', authorizedRoles);
          return true;
        }

        console.log('❌ BK Access denied: User is not authorized for BK');
        this.router.navigate(['/dashboard']);
        return false;
      }),
      catchError(error => {
        console.error('❌ Error checking BK authorization:', error);
        this.router.navigate(['/dashboard']);
        return of(false);
      })
    );
  }
}
