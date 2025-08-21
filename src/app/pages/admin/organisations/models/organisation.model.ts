
export class Organisation {
  id: number;
  numcc: string;
  raisonSocial: string;
  sigle: string;
  logo: string;
  image: any
  // isEranoveGroupe?: boolean
  // isPrincipal?: number

  constructor() {
    this.id = 0
    this.numcc = ''
    this.raisonSocial = ''
    this.sigle = ''
    this.logo = ''
    this.image = {}
  }
}
