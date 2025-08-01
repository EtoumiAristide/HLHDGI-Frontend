import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MENUITEMS.MENU.TEXT',
        isTitle: true
    },
    {
        id: 10,
        label: 'Dashboard',
        icon: 'bx-home-circle',
        link: '/',
    },
    // {
    //     id: 11,
    //     label: 'Partenaire',
    //     icon: 'bx-file',
    //     link: '/partenaires',
    // },
    {
        id: 11,
        label: 'Factures',
        icon: 'bx-file',
        link: '/factures',
    },
    {
        id: 11,
        label: 'Archives',
        icon: 'bx-sitemap',
        link: '/',
    },

];

