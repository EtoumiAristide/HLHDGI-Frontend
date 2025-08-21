import { Organisation } from "../../organisations/models/organisation.model";
import { PointVente } from "./pointvente.model";

export class PointVenteEntreprise {
    organisation: Organisation
    pointVentes: PointVente[]
}