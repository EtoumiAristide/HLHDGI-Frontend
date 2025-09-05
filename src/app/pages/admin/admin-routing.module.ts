import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'organisations', loadChildren: () => import('./organisations/organisations.module').then(m => m.OrganisationsModule) },
  { path: 'point-vente', loadChildren: () => import('./pointvente/pointvente.module').then(m => m.PointventeModule) },
  { path: 'etablissement', loadChildren: () => import('./etablissement/etablissement.module').then(m => m.EtablissementModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
