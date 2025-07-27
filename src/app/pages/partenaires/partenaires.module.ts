import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartenairesRoutingModule } from './partenaire-routing.module';
import { PartenairesComponent } from './partenaires.component';
import { UIModule } from "../../shared/ui/ui.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';



@NgModule({
  declarations: [
    PartenairesComponent
  ],
  imports: [
    CommonModule,
    PartenairesRoutingModule,
    UIModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    ModalModule
]
})
export class PartenairesModule { }
