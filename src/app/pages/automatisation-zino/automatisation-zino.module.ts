import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UIModule } from 'src/app/shared/ui/ui.module';
import { AutomatisationZinoRoutingModule } from './automatisation-zino-routing.module';
import { RapportExtractionZinoComponent } from './rapport/rapport-extraction-zino.component';
import { TooltipModule } from "ngx-bootstrap/tooltip";

@NgModule({
  declarations: [
    RapportExtractionZinoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UIModule,
    AutomatisationZinoRoutingModule,
    TooltipModule
]
})
export class AutomatisationZinoModule { }
