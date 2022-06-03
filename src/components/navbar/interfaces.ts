export type MenuItemsArray = (NavBarItem|NavBarSubMenu)[];
export interface NavBarItem {
    title: string;
    icon?: JSX.Element;
    link?: string;
    action?: ()=>void;
}

export interface NavBarSubMenu {
    title: string;
    icon: JSX.Element;
    items: MenuItemsArray ;
}

export interface MenuEntry {
    hint?: string;
    title: string;
    items?: MenuItemsArray;
    action?: ()=>void;
}