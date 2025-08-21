import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UtilisateursRoutingModule } from './utilisateurs-routing.module';
import { ListeUtilisateurComponent } from './liste-utilisateur/liste-utilisateur.component';
import { FormUtilisateurComponent } from './form-utilisateur/form-utilisateur.component';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AlertModule } from 'ngx-bootstrap/alert';
import { UIModule } from 'src/app/shared/ui/ui.module';


@NgModule({
  declarations: [
    ListeUtilisateurComponent,
    FormUtilisateurComponent
  ],
  imports: [
    CommonModule,
    UtilisateursRoutingModule,
    UIModule,
    FormsModule,
    TooltipModule,
    AlertModule,
  ]
})
export class UtilisateursModule { }
