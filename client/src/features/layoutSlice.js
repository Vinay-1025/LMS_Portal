import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCollapsed: false,
  isMobile: false,
  isMobileMenuOpen: false,
};

export const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.isCollapsed = action.payload;
    },
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
      if (!action.payload) {
        state.isMobileMenuOpen = false;
      }
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setIsMobile,
  toggleMobileMenu,
  closeMobileMenu
} = layoutSlice.actions;

export default layoutSlice.reducer;
