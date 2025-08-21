import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { MetamenuComponent } from './metamenu/metamenu.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { UIModule } from 'src/app/shared/ui/ui.module';


@NgModule({
  declarations: [
    MetamenuComponent,
    PermissionsComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    UIModule,
    NgSelectModule,
    FormsModule,
    TooltipModule
  ]
})
export class SettingsModule { }
