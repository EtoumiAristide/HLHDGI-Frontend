import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
// import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { UserApiService } from 'src/app/account/auth/login/service/user.service';

@Injectable()
export class AuthInterceptor //implements HttpInterceptor 
{

    /*constructor(
        private authService: UserApiService,
        private jwtHelper: JwtHelperService,
        private router: Router
    ) { }

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const token = this.authService.getToken();

        if (token && this.jwtHelper.isTokenExpired(token)) {
            // Token expiré → on nettoie et on redirige
            this.authService.logout();
            this.router.navigate(['/auth']);
            return throwError(() => new Error('Session expirée'));
        }

        return next.handle(req);
    }*/
}