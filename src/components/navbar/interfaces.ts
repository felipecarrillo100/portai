export type MenuItemsArray = (NavBarItem|NavBarSubMenu|NanBarSeparator)[];
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

export interface NanBarSeparator {
    separator: boolean;
}