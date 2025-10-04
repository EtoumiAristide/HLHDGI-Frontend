import { Organisation } from "../../organisations/models/organisation.model";

export class Etablissement {
  id: number;
  nom: string;
  organisation: Organisation;

  constructor() {
    this.id = 0
    this.nom = ''
    this.organisation = new Organisation()
  }
}
