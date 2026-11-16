import { createSlice } from "@reduxjs/toolkit";
import type { Service } from "@/types/service";
import type { RequestState } from "@/types/request";

type ServicesState = {
  items: Service[];
  selectedService: Service | null;
  requests: {
    fetchServices: RequestState;
    fetchServiceById: RequestState;
    createService: RequestState;
    updateService: RequestState;
    toggleServiceStatus: Partial<Record<number, RequestState>>;
    deleteService: Partial<Record<number, RequestState>>;
  };
};

const initialState: ServicesState = {
  items: [],
  selectedService: null,
  requests: {
    fetchServices: { loading: false, error: null },
    fetchServiceById: { loading: false, error: null },
    createService: { loading: false, error: null },
    updateService: { loading: false, error: null },
    toggleServiceStatus: {},
    deleteService: {},
  },
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
});

export default servicesSlice.reducer;