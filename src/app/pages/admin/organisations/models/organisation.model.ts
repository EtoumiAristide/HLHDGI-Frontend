
export class Organisation {
  id: number;
  numcc: string;
  raisonSocial: string;
  sigle: string;
  logo: string;
  image: any
  indexLectureFichier: number;
  isOrderedByPaiementMethod: boolean;
  isPrixUnitaireDefined: boolean;
  isFactureInitiale: boolean;
  isTDTBaseTVA: boolean;
  isFacturationMultiple: boolean;
  isAvoirFirstVersion: boolean;
  isBkWorkflow: boolean;

  valeurTVA: number;
  valeurTDT: number;
  valeurTCN: number;
  constructor() {
    this.id = 0
    this.numcc = ''
    this.raisonSocial = ''
    this.sigle = ''
    this.logo = ''
    this.image = {}
    this.indexLectureFichier = 0
    this.isOrderedByPaiementMethod = false
    this.isPrixUnitaireDefined = false
    this.isFactureInitiale = false
    this.isTDTBaseTVA = false
    this.isFacturationMultiple = false
    this.isAvoirFirstVersion = false
  }
}
