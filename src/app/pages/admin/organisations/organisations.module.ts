import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { UiSwitchModule } from 'ngx-ui-switch';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { OrganisationsRoutingModule } from './organisations-routing.module';
import { OrganisationsComponent } from './organisations.component';


@NgModule({
  declarations: [
    OrganisationsComponent,
  ],
  imports: [
    CommonModule,
    UIModule,
    OrganisationsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    ModalModule,
    UiSwitchModule,
    PopoverModule,
    TooltipModule
  ]
})
export class OrganisationsModule { }
