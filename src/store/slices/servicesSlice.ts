import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getServices } from "@/lib/api/services";
import type { Service } from "@/types/service";
import type { RequestState } from "@/types/request";

type ServicesState = {
  items: Service[];
  selectedService: Service | null;
  hasLoaded: boolean;
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
  hasLoaded: false,
  requests: {
    fetchServices: { loading: false, error: null },
    fetchServiceById: { loading: false, error: null },
    createService: { loading: false, error: null },
    updateService: { loading: false, error: null },
    toggleServiceStatus: {},
    deleteService: {},
  },
};

export const fetchServices = createAsyncThunk<
  Service[],
  void,
  {
    state: { services: ServicesState };
    rejectValue: string;
  }
>(
  "services/fetchServices",
  async (_, { rejectWithValue, signal }) => {
    try {
      return await getServices(signal);
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Cannot reach the API. Check that json-server is running."
          : error instanceof Error
            ? error.message
            : "Unable to load services. Please try again.";

      return rejectWithValue(message);
    }
  },
  {
    condition: (_, { getState }) => {
      return !getState().services.requests.fetchServices.loading;
    },
  },
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.requests.fetchServices.loading = true;
        state.requests.fetchServices.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.items = action.payload;
        state.hasLoaded = true;
        state.requests.fetchServices.loading = false;
        state.requests.fetchServices.error = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.requests.fetchServices.loading = false;
        state.requests.fetchServices.error =
          action.payload ?? "Unable to load services. Please try again.";
      });
  },
});

export default servicesSlice.reducer;