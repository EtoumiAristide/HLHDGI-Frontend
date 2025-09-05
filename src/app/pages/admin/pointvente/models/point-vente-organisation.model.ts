import { Etablissement } from "../../etablissement/models/etablissement.model";
import { Organisation } from "../../organisations/models/organisation.model";
import { PointVente } from "./pointvente.model";

export class PointVenteEntreprise {
    organisation: Organisation
    etablissements: PointVenteEtablissement[]
}

export class PointVenteEtablissement {
    etablissement: Etablissement
    pointVentes: PointVente[]
}