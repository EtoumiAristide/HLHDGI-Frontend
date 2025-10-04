import { Etablissement } from "../../etablissement/models/etablissement.model";
import { Organisation } from "../../organisations/models/organisation.model";

export class PointVente {
  id: number;
  nom: string;
  // organisation: Organisation;
  etablissement: Etablissement

  constructor() {
    this.id = 0
    this.nom = ''
    // this.organisation = new Organisation
    this.etablissement = new Etablissement()
  }
}
