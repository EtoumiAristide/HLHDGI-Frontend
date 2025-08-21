import { MenuItem } from "src/app/layouts/sidebar/menu.model"

export interface Permission {
    role: string
    menus: MenuData[]
}

export interface MenuData {
    id: number
    libelle: string
    isActive: boolean
}

export interface PermissionPayload {
    id?: number
    roleName?: string,
    menu?: MenuItem
}