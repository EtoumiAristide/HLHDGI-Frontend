export class Facture {
    id: number
    numFacture: string
    dateFacture: string
    nomClient: string
    lienFichier: string
    typeFacture: string
    dateCreation: string
    dateModification: string
    reponseFNE: any

    constructor() {
        this.id = 0
        this.numFacture = ''
        this.dateFacture = ''
        this.nomClient = ''
        this.lienFichier = ''
        this.typeFacture = ''
        this.dateCreation = ''
        this.dateModification = ''
        // this.reponseFNE = {}
    }
}