import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { StatistiquesRoutingModule } from './statistiques-routing.module';
import { TimbresComponent } from './timbres/timbres.component';

@NgModule({
  declarations: [
    TimbresComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UIModule,
    StatistiquesRoutingModule
  ]
})
export class StatistiquesModule { }
