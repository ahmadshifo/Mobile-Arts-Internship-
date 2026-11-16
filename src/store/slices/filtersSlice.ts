import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ServiceOperator } from "@/types/service";

type FiltersState = {
  search: string;
  operator: ServiceOperator | "all";
};

const initialState: FiltersState = {
  search: "",
  operator: "all",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    setOperator(
      state,
      action: PayloadAction<FiltersState["operator"]>,
    ) {
      state.operator = action.payload;
    },

    resetFilters() {
      return initialState;
    },
  },
});

export const { setSearch, setOperator, resetFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;