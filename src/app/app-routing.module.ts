import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { KeycloakGuard } from './core-custom/guard/keycloak.auth.guard';
import { Page404Component } from './extrapages/page404/page404.component';
import { LayoutComponent } from './layouts/layout.component';
// import { AuthGuard } from './core-custom/guard/auth-guard';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: '', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [KeycloakGuard] },
  // { path: 'pages', loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule), canActivate: [AuthGuard] },
  // { path: 'crypto-ico-landing', component: CyptolandingComponent },
  { path: '**', component: Page404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
