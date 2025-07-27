import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserApiService } from 'src/app/account/auth/login/service/user.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private authService: UserApiService,
        private jwtHelper: JwtHelperService,
        private router: Router
    ) { }

    canActivate(): boolean {
        const token = this.authService.getToken();
        if (token && !this.jwtHelper.isTokenExpired(token)) {
            return true;
        }

        this.authService.logout();
        this.router.navigate(['/auth']);
        return false;
    }
}