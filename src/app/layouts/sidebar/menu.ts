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
    {
        id: 5,
        label: 'Statistiques',
        icon: 'bx-chart',
        roles: ['Stats'],   // 👈 ROLE REQUIS
        subItems: [
            {
                id: 6,
                label: 'Timbres',
                link: '/statistiques/timbres',
                parentId: 5
            },
        ]
    },
    {
        id: 7,
        label: 'Paramétrage',
        icon: 'bx-customize',
        roles: ['Super-Admin'],   // 👈 ROLE REQUIS
        subItems: [
            {
                id: 8,
                label: 'Partenaires',
                link: '/ecommerce/products',
                parentId: 7,
                subItems:[
                    {
                        id: 9,
                        label: 'Entreprises',
                        link: '/parametrage/organisations',
                        parentId: 8
                    },
                    {
                        id: 10,
                        label: 'Etablissement',
                        link: '/parametrage/etablissement',
                        parentId: 8
                    },
                    {
                        id: 11,
                        label: 'Points de vente',
                        link: '/parametrage/point-vente',
                        parentId: 8
                    },
                ]
            },
            {
                id: 12,
                label: 'Gestion Menu',
                link: '/ecommerce/products',
                parentId: 7,
                subItems: [
                    {
                        id: 13,
                        label: 'Section',
                        link: '/ecommerce/products',
                        parentId: 12
                    },
                    {
                        id: 14,
                        label: 'Menu',
                        link: '/ecommerce/products',
                        parentId: 12    
                    },
                    {
                        id: 15,
                        label: 'Sous-Menu',
                        link: '/ecommerce/products',
                        parentId: 12
                    },
                ]
            },
            {
                id: 16,
                label: 'Gestion Utilisateurs',
                link: '/ecommerce/products',
                parentId: 7,
                subItems: [

                    {
                        id: 17,
                        label: 'Rôles',
                        link: '/ecommerce/products',
                        parentId: 16
                    },
                    {
                        id: 18,
                        label: 'Utilisateur',
                        link: '/ecommerce/products',
                        parentId: 16
                    },
                    {
                        id: 19,
                        label: 'Privilèges',
                        link: '/ecommerce/products',
                        parentId: 16
                    },
                ]
            },
        ]
    },

];

