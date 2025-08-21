import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionsComponent } from './permissions/permissions.component';
import { MetamenuComponent } from './metamenu/metamenu.component';

const routes: Routes = [
  {
    path: 'permissions', component: PermissionsComponent
  },
  {
    path: 'roles', component: MetamenuComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
