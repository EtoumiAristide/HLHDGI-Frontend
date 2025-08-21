import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganisationsComponent } from './organisations.component';
import { PointventeComponent } from '../pointvente/pointvente.component';

const routes: Routes = [
  {
    path: '',
    component: OrganisationsComponent,
    title: 'Organisation'
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganisationsRoutingModule { }
