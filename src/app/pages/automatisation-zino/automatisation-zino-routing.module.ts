import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImpressionAdminApiComponent } from './impression-admin-api/impression-admin-api.component';
import { ImpressionAdminApiConfigComponent } from './impression-admin-api/impression-admin-api-config.component';
import { RapportExtractionZinoComponent } from './rapport/rapport-extraction-zino.component';

const routes: Routes = [
  {
    path: 'rapport-extraction',
    component: RapportExtractionZinoComponent,
    title: "Rapport d'état des extractions - Zino"
  },
  {
    path: 'impression-admin-api',
    component: ImpressionAdminApiComponent,
    title: 'Impression Admin API'
  },
  {
    path: 'impression-admin-api/configuration',
    component: ImpressionAdminApiConfigComponent,
    title: 'Configuration Impression Admin API'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutomatisationZinoRoutingModule { }
