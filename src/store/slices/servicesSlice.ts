import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getServiceById,
  getServices,
  patchServiceStatus,
  postService,
  putService,
  removeService,
} from "@/lib/api/services";
import {
  serviceSchema,
  type ServiceFormValues,
} from "@/lib/validation/service";
import { resetFilters } from "@/store/slices/filtersSlice";
import { addToast } from "@/store/slices/uiSlice";
import type { Service } from "@/types/service";
import type { RequestState } from "@/types/request";

type ServicesState = {
  items: Service[];
  selectedService: Service | null;
  detailsId: number | null;
  detailsRequestId: string | null;
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
  detailsId: null,
  detailsRequestId: null,
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

export const createService = createAsyncThunk<
  Service,
  ServiceFormValues,
  ServiceThunkConfig
>(
  "services/createService",
  async (values, { dispatch, rejectWithValue }) => {
    try {
      const validation = serviceSchema.safeParse(values);

      if (!validation.success) {
        throw new Error("Please correct the service details.");
      }

      const newService: Omit<Service, "id"> = {
        ...validation.data,
        subscribers: 0,
        createdAt: new Date().toISOString(),
      };

      const savedService = await postService(newService);

      dispatch(resetFilters());

      dispatch(
        addToast({
          type: "success",
          message: "Service created",
        }),
      );

      return savedService;
    } catch (error) {
      const message = getRequestError(
        error,
        "Unable to create service.",
      );

      dispatch(
        addToast({
          type: "error",
          message,
        }),
      );

      return rejectWithValue(message);
    }
  },
  {
    condition: (_, { getState }) =>
      !getState().services.requests.createService.loading,
  },
);

export const fetchServiceById = createAsyncThunk<
  Service | null,
  number,
  ServiceThunkConfig
>(
  "services/fetchServiceById",
  async (id, { signal, rejectWithValue }) => {
    try {
      return await getServiceById(id, signal);
    } catch (error) {
      return rejectWithValue(
        getRequestError(error, "Unable to load service."),
      );
    }
  },
);

export const updateService = createAsyncThunk<
  Service,
  { id: number; values: ServiceFormValues },
  ServiceThunkConfig
>(
  "services/updateService",
  async ({ id, values }, { dispatch, rejectWithValue }) => {
    try {
      const validation = serviceSchema.safeParse(values);

      if (!validation.success) {
        throw new Error("Please correct the service details.");
      }

      const existingService = await getServiceById(id);

      if (!existingService) {
        throw new Error("This service no longer exists.");
      }

      const updatedService: Service = {
        ...existingService,
        ...validation.data,
        description: validation.data.description ?? "",
        id,
      };

      const savedService = await putService(id, updatedService);

      dispatch(
        addToast({
          type: "success",
          message: "Service updated",
        }),
      );

      return savedService;
    } catch (error) {
      const message = getRequestError(
        error,
        "Unable to update service.",
      );

      dispatch(addToast({ type: "error", message }));

      return rejectWithValue(message);
    }
  },
  {
    condition: ({ id }, { getState }) => {
      const requests = getState().services.requests;

      return (
        !requests.updateService.loading &&
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
      .addCase(fetchServiceById.pending, (state, action) => {
        state.selectedService = null;
        state.detailsId = action.meta.arg;
        state.detailsRequestId = action.meta.requestId;

        state.requests.fetchServiceById = {
        loading: true,
        error: null,
        };
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        if (state.detailsRequestId !== action.meta.requestId) {
        return;
        }

        state.selectedService = action.payload;

        state.requests.fetchServiceById = {
        loading: false,
        error: null,
        };
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        if (state.detailsRequestId !== action.meta.requestId) {
        return;
        }

        state.requests.fetchServiceById = {
        loading: false,
        error: action.meta.aborted
            ? null
            : action.payload ?? "Unable to load service.",
        };
      })
      .addCase(updateService.pending, (state) => {
        state.requests.updateService = {
        loading: true,
        error: null,
        };
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const savedService = action.payload;

        const index = state.items.findIndex(
        (service) => service.id === savedService.id,
        );

        if (index !== -1) {
        state.items[index] = savedService;
        }

        if (state.detailsId === savedService.id) {
        state.selectedService = savedService;
        }

        state.requests.updateService = {
        loading: false,
        error: null,
        };
      })
      .addCase(updateService.rejected, (state, action) => {
        state.requests.updateService = {
        loading: false,
        error: action.payload ?? "Unable to update service.",
        };
      });
    builder
      .addCase(createService.pending, (state) => {
        state.requests.createService = {
        loading: true,
        error: null,
        };
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.items.push(action.payload);

        state.requests.createService = {
        loading: false,
        error: null,
        };
      })
      .addCase(createService.rejected, (state, action) => {
        state.requests.createService = {
        loading: false,
        error: action.payload ?? "Unable to create service.",
        };
      });

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