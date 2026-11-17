import { Etablissement } from "../../etablissement/models/etablissement.model";
import { Organisation } from "../../organisations/models/organisation.model";

export class PointVente {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  nomVendeur: string;
  // organisation: Organisation;
  etablissement: Etablissement

  constructor() {
    this.id = 0
    this.nom = ''
    this.adresse = ''
    this.telephone = ''
    this.nomVendeur = ''
    // this.organisation = new Organisation
    this.etablissement = new Etablissement()
  }
}
