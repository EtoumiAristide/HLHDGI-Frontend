import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointventeComponent } from './pointvente.component';

const routes: Routes = [
  {
    path: '',
    component: PointventeComponent,
    title: 'Point de vente'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PointventeRoutingModule { }
