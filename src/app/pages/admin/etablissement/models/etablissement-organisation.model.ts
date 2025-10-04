import { Organisation } from "../../organisations/models/organisation.model";
import { Etablissement } from "./etablissement.model";

export class EtablissementEntreprise {
    organisation: Organisation
    etablissements: Etablissement[]
}