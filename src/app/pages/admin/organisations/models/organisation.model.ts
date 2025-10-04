
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
  // isEranoveGroupe?: boolean
  // isPrincipal?: number

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
  }
}
