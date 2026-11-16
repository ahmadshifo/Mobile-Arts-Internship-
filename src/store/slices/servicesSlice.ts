import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getServices,
  patchServiceStatus,
  removeService,
} from "@/lib/api/services";
import { addToast } from "@/store/slices/uiSlice";
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

type ServiceThunkConfig = {
  state: { services: ServicesState };
  rejectValue: string;
};

function getRequestError(error: unknown, fallback: string): string {
  if (error instanceof TypeError) {
    return "Cannot reach the API. Check that json-server is running.";
  }

  return error instanceof Error ? error.message : fallback;
}

export const toggleServiceStatus = createAsyncThunk<
  Service,
  number,
  ServiceThunkConfig
>(
  "services/toggleServiceStatus",
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const service = getState().services.items.find(
        (item) => item.id === id,
      );

      if (!service) {
        throw new Error("Service not found.");
      }

      const nextStatus =
        service.status === "Active" ? "Paused" : "Active";

      const updatedService = await patchServiceStatus(id, nextStatus);

      dispatch(
        addToast({
          type: "success",
          message:
            updatedService.status === "Active"
              ? "Service activated"
              : "Service paused",
        }),
      );

      return updatedService;
    } catch (error) {
      const message = getRequestError(error, "Unable to update status.");

      dispatch(addToast({ type: "error", message }));

      return rejectWithValue(message);
    }
  },
  {
    condition: (id, { getState }) => {
      const requests = getState().services.requests;

      return (
        !requests.toggleServiceStatus[id]?.loading &&
        !requests.deleteService[id]?.loading
      );
    },
  },
);

export const deleteService = createAsyncThunk<
  number,
  number,
  ServiceThunkConfig
>(
  "services/deleteService",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await removeService(id);

      dispatch(
        addToast({
          type: "success",
          message: "Service deleted",
        }),
      );

      return id;
    } catch (error) {
      const message = getRequestError(error, "Unable to delete service.");

      dispatch(addToast({ type: "error", message }));

      return rejectWithValue(message);
    }
  },
  {
    condition: (id, { getState }) => {
      const requests = getState().services.requests;

      return (
        !requests.deleteService[id]?.loading &&
        !requests.toggleServiceStatus[id]?.loading
      );
    },
  },
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {  
    clearDeleteError(state, action: PayloadAction<number>) {
        const request = state.requests.deleteService[action.payload];

    if (request) {
                request.error = null;
            }
        },
    },
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
      builder
  .addCase(toggleServiceStatus.pending, (state, action) => {
    state.requests.toggleServiceStatus[action.meta.arg] = {
      loading: true,
      error: null,
    };
  })
  .addCase(toggleServiceStatus.fulfilled, (state, action) => {
    const updatedService = action.payload;

    const index = state.items.findIndex(
      (service) => service.id === updatedService.id,
    );

    if (index !== -1) {
      state.items[index] = updatedService;
    }

    if (state.selectedService?.id === updatedService.id) {
      state.selectedService = updatedService;
    }

    state.requests.toggleServiceStatus[action.meta.arg] = {
      loading: false,
      error: null,
    };
  })
  .addCase(toggleServiceStatus.rejected, (state, action) => {
    state.requests.toggleServiceStatus[action.meta.arg] = {
      loading: false,
      error: action.payload ?? "Unable to update status.",
    };
  })
  .addCase(deleteService.pending, (state, action) => {
    state.requests.deleteService[action.meta.arg] = {
      loading: true,
      error: null,
    };
  })
  .addCase(deleteService.fulfilled, (state, action) => {
    const deletedId = action.payload;

    state.items = state.items.filter(
      (service) => service.id !== deletedId,
    );

    if (state.selectedService?.id === deletedId) {
      state.selectedService = null;
    }

    state.requests.deleteService[deletedId] = {
      loading: false,
      error: null,
    };

    delete state.requests.toggleServiceStatus[deletedId];
  })
  .addCase(deleteService.rejected, (state, action) => {
    state.requests.deleteService[action.meta.arg] = {
      loading: false,
      error: action.payload ?? "Unable to delete service.",
    };
  });
  },
});
export const { clearDeleteError } = servicesSlice.actions;
export default servicesSlice.reducer;