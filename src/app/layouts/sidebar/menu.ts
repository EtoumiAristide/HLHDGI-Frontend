import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MENUITEMS.MENU.TEXT',
        isTitle: true
    },
    {
        id: 2,
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
        id: 3,
        label: 'Factures',
        icon: 'bx-file',
        link: '/factures',
    },
    {
        id: 4,
        label: 'Archives',
        icon: 'bx-sitemap',
        link: '/',
    },
    /*{
        id: 5,
        label: 'Paramétrage',
        icon: 'bx-customize',
        subItems: [
            {
                id: 6,
                label: 'Partenaires',
                link: '/ecommerce/products',
                parentId: 5,
                subItems:[
                    {
                        id: 7,
                        label: 'Entreprises',
                        link: '/parametrage/organisations',
                        parentId: 6
                    },
                    {
                        id: 7,
                        label: 'Etablissement',
                        link: '/parametrage/etablissement',
                        parentId: 6
                    },
                    {
                        id: 8,
                        label: 'Points de vente',
                        link: '/parametrage/point-vente',
                        parentId: 6
                    },
                ]
            },
            {
                id: 9,
                label: 'Gestion Menu',
                link: '/ecommerce/products',
                parentId: 5,
                subItems: [

                    {
                        id: 10,
                        label: 'Section',
                        link: '/ecommerce/products',
                        parentId: 9
                    },
                    {
                        id: 11,
                        label: 'Menu',
                        link: '/ecommerce/products',
                        parentId: 9
                    },
                    {
                        id: 12,
                        label: 'Sous-Menu',
                        link: '/ecommerce/products',
                        parentId: 9
                    },
                ]
            },
            {
                id: 13,
                label: 'Gestion Utilisateurs',
                link: '/ecommerce/products',
                parentId: 5,
                subItems: [

                    {
                        id: 14,
                        label: 'Rôles',
                        link: '/ecommerce/products',
                        parentId: 13
                    },
                    {
                        id: 15,
                        label: 'Utilisateur',
                        link: '/ecommerce/products',
                        parentId: 13
                    },
                    {
                        id: 16,
                        label: 'Privilèges',
                        link: '/ecommerce/products',
                        parentId: 13
                    },
                ]
            },
        ]
    },*/

];

