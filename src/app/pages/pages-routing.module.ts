import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './dashboards/default/default.component';
import { KeycloakAuthGuard } from 'keycloak-angular';
import { KeycloakGuard } from '../core-custom/guard/keycloak.auth.guard';

const routes: Routes = [
  // { path: '', redirectTo: 'dashboard' },
  {
    path: "",
    component: DefaultComponent
  },
  { path: 'dashboard', component: DefaultComponent, canActivate: [KeycloakGuard] },
  { path: 'dashboards', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule), canActivate: [KeycloakGuard] },
  { path: 'partenaires', loadChildren: () => import('./partenaires/partenaires.module').then(m => m.PartenairesModule) , canActivate: [KeycloakGuard]},
  { path: 'factures', loadChildren: () => import('./factures/factures.module').then(m => m.FacturesModule), canActivate: [KeycloakGuard] },
  { path: 'bk', redirectTo: 'timbre', pathMatch: 'full' },
  { path: 'timbre', loadChildren: () => import('./bk/bk.module').then(m => m.BkModule), canActivate: [KeycloakGuard] },
  { path: 'parametrage', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [KeycloakGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
