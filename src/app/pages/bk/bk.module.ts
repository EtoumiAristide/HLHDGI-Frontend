import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BkRoutingModule } from './bk-routing.module';
import { BkTimbreComponent } from './bk-timbre/bk-timbre.component';
import { UIModule } from 'src/app/shared/ui/ui.module';

@NgModule({
  declarations: [BkTimbreComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BkRoutingModule,
    UIModule,
  ]
})
export class BkModule { }
