import { KeycloakService } from "keycloak-angular";
import { environment } from "src/environments/environment";

export function initializeKeycloak(
    keycloak: KeycloakService
) {
    return () =>
        keycloak.init({
            config: {
                url: environment.keycloak.authority,
                realm: environment.keycloak.realm,
                clientId: environment.keycloak.clientId,
            },
            initOptions: {
                onLoad: 'login-required',  // allowed values 'login-required', 'check-sso';
                flow: "standard"          // allowed values 'standard', 'implicit', 'hybrid';
            },
            bearerExcludedUrls: ['/assets'],
        });
}