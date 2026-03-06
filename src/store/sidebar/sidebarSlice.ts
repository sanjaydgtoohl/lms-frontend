import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface SidebarState {
  menu: any[];
}

const initialState: SidebarState = {
  menu: [],
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSidebarMenu(state, action: PayloadAction<any[]>) {
      state.menu = action.payload;
    },
    clearSidebarMenu(state) {
      state.menu = [];
    },
  },
});

export const { setSidebarMenu, clearSidebarMenu } = sidebarSlice.actions;
export default sidebarSlice.reducer;