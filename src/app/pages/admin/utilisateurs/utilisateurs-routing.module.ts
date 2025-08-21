import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ListeUtilisateurComponent} from "./liste-utilisateur/liste-utilisateur.component";
import { FormUtilisateurComponent } from './form-utilisateur/form-utilisateur.component';

const routes: Routes = [
  { path: '', component: ListeUtilisateurComponent },
  { path: 'form', component: FormUtilisateurComponent },
  { path: 'form/:id', component: FormUtilisateurComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilisateursRoutingModule { }
