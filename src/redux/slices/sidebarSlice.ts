import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface SidebarState {
  isCollapsed: boolean;
  expandedItems: string[];
  mobileOpen: boolean;
}

const initialState: SidebarState = {
  isCollapsed: false,
  expandedItems: [],
  mobileOpen: false,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isCollapsed = !state.isCollapsed;
    },
    setCollapsed(state, action: PayloadAction<boolean>) {
      state.isCollapsed = action.payload;
    },
    toggleExpandedItem(state, action: PayloadAction<string>) {
      const item = action.payload;
      if (state.expandedItems.includes(item)) {
        state.expandedItems = state.expandedItems.filter(i => i !== item);
      } else {
        state.expandedItems = [item]; // single open behavior
      }
    },
    setExpandedItems(state, action: PayloadAction<string[]>) {
      state.expandedItems = action.payload;
    },
    toggleMobile(state) {
      state.mobileOpen = !state.mobileOpen;
    },
    setMobileOpen(state, action: PayloadAction<boolean>) {
      state.mobileOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setCollapsed,
  toggleExpandedItem,
  setExpandedItems,
  toggleMobile,
  setMobileOpen,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;