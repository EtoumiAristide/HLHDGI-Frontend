import { Injectable } from "@angular/core";
import { url_path } from "src/app/core-custom/constants/app.constant";
import { ApiRequestService } from "src/app/core-custom/services/api-request.service";

@Injectable({
    providedIn: 'root'
})
export class UserApiService {
    constructor(private _apiRequestService: ApiRequestService) { }

    login(data: any) {
        return this._apiRequestService.post({ endpoint: url_path.LOGIN + '/login', data: JSON.stringify(data) })
    }

    logout() {
        localStorage.removeItem('access_token');
    }

    public getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    public isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;

        const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
        return (Math.floor(new Date().getTime() / 1000)) < expiry;
    }
}