import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BkTimbreComponent } from './bk-timbre/bk-timbre.component';
import { BkAuthGuard } from 'src/app/core-custom/guard/bk-auth.guard';

const routes: Routes = [
  {
    path: '',
    component: BkTimbreComponent,
    title: 'BK - Droits de timbre',
    canActivate: [BkAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BkRoutingModule { }
