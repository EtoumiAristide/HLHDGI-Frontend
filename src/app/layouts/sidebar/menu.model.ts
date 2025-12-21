export interface MenuItem {
    id?: number;
    label?: string;
    icon?: string;
    link?: string;
    subItems?: any;
    isTitle?: boolean;
    badge?: any;
    parentId?: number;
    parentLabel?: string;
    isLayout?: boolean;
    roles?: string[];
}
