import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { KeycloakGuard } from '../core-custom/guard/keycloak.auth.guard';
import { DefaultComponent } from './dashboards/default/default.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard' },
  // {
  //   path: "",
  //   component: DefaultComponent
  // },
  { path: 'dashboard', component: DefaultComponent, canActivate: [KeycloakGuard], title: 'Dashboard' },
  { path: 'dashboards', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule), canActivate: [KeycloakGuard], title: 'Dashboards' },
  { path: 'partenaires', loadChildren: () => import('./partenaires/partenaires.module').then(m => m.PartenairesModule) , canActivate: [KeycloakGuard]},
  { path: 'factures', loadChildren: () => import('./factures/factures.module').then(m => m.FacturesModule), canActivate: [KeycloakGuard], title: 'Factures' },
  { path: 'statistiques', loadChildren: () => import('./statistiques/statistiques.module').then(m => m.StatistiquesModule), canActivate: [KeycloakGuard], title: 'Statistiques' },
  { path: 'automatisation-zino', loadChildren: () => import('./automatisation-zino/automatisation-zino.module').then(m => m.AutomatisationZinoModule), canActivate: [KeycloakGuard], title: 'Automatisation Zino' },
  { path: 'parametrage', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [KeycloakGuard], title: 'Paramétrage' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
