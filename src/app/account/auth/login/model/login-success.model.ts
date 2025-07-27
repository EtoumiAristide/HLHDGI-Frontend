export class LoginSuccess {
    token: string
    id: number
    username: string
    authorities: Authority[]
    type: string
}

export class Authority {
    authority: string

    constructor() {
        this.authority = ''
    }
}