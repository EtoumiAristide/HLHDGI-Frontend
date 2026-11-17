import { Organisation } from "../../organisations/models/organisation.model";

export class Etablissement {
  id: number;
  nom: string;
  organisation: Organisation;
  adresse: string;
  telephone: string;
  email: string;
  referencesBancaires: string;

  constructor() {
    this.id = 0
    this.nom = ''
    this.adresse = ''
    this.telephone = ''
    this.email = ''
    this.referencesBancaires = ''
    this.organisation = new Organisation()
  }
}
