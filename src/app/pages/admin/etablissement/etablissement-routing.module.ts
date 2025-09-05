import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EtablissementComponent } from './etablissement.component';

const routes: Routes = [
  {
      path: '',
      component: EtablissementComponent,
      title: 'Etablissement'
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EtablissementRoutingModule { }
