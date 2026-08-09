import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RapportExtractionZinoComponent } from './rapport/rapport-extraction-zino.component';

const routes: Routes = [
  {
    path: 'rapport-extraction',
    component: RapportExtractionZinoComponent,
    title: "Rapport d'état des extractions - Zino"
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutomatisationZinoRoutingModule { }
