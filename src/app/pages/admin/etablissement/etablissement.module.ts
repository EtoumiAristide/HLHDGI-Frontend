import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EtablissementRoutingModule } from './etablissement-routing.module';
import { EtablissementComponent } from './etablissement.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AngularTreeGridModule } from 'angular-tree-grid';


@NgModule({
  declarations: [
    EtablissementComponent
  ],
  imports: [
    CommonModule,
    EtablissementRoutingModule,
    NgSelectModule,
    UIModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    ModalModule,
    AngularTreeGridModule
  ]
})
export class EtablissementModule { }
