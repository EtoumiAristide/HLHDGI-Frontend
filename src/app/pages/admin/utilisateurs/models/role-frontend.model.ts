export interface RoleDto {
    id?: string,
    name?: string,
    description?: string,
    containerId?: string,
    composites?: string,
    composite?: boolean,
    clientRole?: boolean,
    attributes?: boolean,
}