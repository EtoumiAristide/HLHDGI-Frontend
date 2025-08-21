import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganisationsRoutingModule } from './organisations-routing.module';
import { OrganisationsComponent } from './organisations.component';
import { PointventeComponent } from '../pointvente/pointvente.component';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';


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
  ]
})
export class OrganisationsModule { }
