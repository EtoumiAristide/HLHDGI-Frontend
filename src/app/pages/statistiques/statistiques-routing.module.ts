import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimbresComponent } from './timbres/timbres.component';

const routes: Routes = [
  {
    path: 'timbres',
    component: TimbresComponent,
    title: 'Statistiques Timbres'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatistiquesRoutingModule { }
