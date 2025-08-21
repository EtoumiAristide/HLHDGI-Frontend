import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PointventeRoutingModule } from './pointvente-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PointventeComponent } from './pointvente.component';
import { AngularTreeGridModule } from 'angular-tree-grid';


@NgModule({
  declarations: [PointventeComponent],
  imports: [
    CommonModule,
    PointventeRoutingModule,
    NgSelectModule,
    UIModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    ModalModule,
    AngularTreeGridModule
  ]
})
export class PointventeModule { }
