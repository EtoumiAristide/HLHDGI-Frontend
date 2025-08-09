import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturesComponent } from './factures.component';
import { FactureFormComponent } from './facture-form/facture-form.component';

const routes: Routes = [
  {
    path: '',
    component: FacturesComponent,
    title: 'Liste Factures'
  },
  {
    path: 'create',
    component: FactureFormComponent,
    title: 'Facture | Nouveau'
  },
  {
    path: 'edit/:id',
    component: FactureFormComponent,
    title: 'Facture | Modification'
  },
  {
    path: 'view/:id',
    component: FactureFormComponent,
    title: 'Facture | Consultation'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturesRoutingModule { }
