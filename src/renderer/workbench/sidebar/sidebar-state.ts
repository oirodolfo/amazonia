/**
 * Layout/search state for grouped action sidebars (integrated workbench).
 */
export interface SidebarState {
    readonly searchQuery: string;
    readonly selectedPackageId: string | null;
}

export type SidebarEvent =
    | { readonly type: 'search.query'; readonly query: string }
    | { readonly type: 'package.selected'; readonly packageId: string | null };

export const defaultSidebarState: SidebarState = {
    searchQuery: '',
    selectedPackageId: null,
};

export function sidebarReducer(state: SidebarState, event: SidebarEvent): SidebarState {
    if (event.type === 'search.query') {
        return {...state, searchQuery: event.query};
    }
    if (event.type === 'package.selected') {
        return {...state, selectedPackageId: event.packageId};
    }

    return state;
}
