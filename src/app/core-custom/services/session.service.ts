import { Injectable, NgZone } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { UserApiService } from 'src/app/account/auth/login/service/user.service';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private warningTimeInSeconds = 60; // 1 min avant expiration
    private checkIntervalInMs = 10000; // toutes les 10s
    private warningShown = false;

    public onSessionWarning = new Subject<number>();
    public onSessionExpired = new Subject<void>();

    constructor(
        private jwtHelper: JwtHelperService,
        private authService: UserApiService,
        private router: Router,
        private ngZone: NgZone
    ) { }

    startTokenWatcher() {
        this.ngZone.runOutsideAngular(() => {
            timer(0, this.checkIntervalInMs).subscribe(() => {
                const token = this.authService.getToken();
                if (token && !this.jwtHelper.isTokenExpired(token)) {
                    const exp = this.jwtHelper.getTokenExpirationDate(token);
                    if (!exp) return;

                    const timeLeft = (exp.getTime() - new Date().getTime()) / 1000;

                    if (timeLeft <= this.warningTimeInSeconds && !this.warningShown) {
                        this.warningShown = true;
                        this.ngZone.run(() => {
                            this.onSessionWarning.next(Math.floor(timeLeft));
                        });
                    }

                    if (timeLeft <= 0) {
                        this.ngZone.run(() => {
                            this.authService.logout();
                            this.router.navigate(['/auth']);
                            this.onSessionExpired.next();
                        });
                    }
                }
            });
        });
    }

    resetWarning() {
        this.warningShown = false;
    }
}