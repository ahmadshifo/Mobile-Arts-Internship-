import {
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import servicesReducer from "./slices/servicesSlice";
import filtersReducer from "./slices/filtersSlice";
import uiReducer, {
  addToast,
  removeToast,
} from "./slices/uiSlice";

export const makeStore = () => {
  const toastListener = createListenerMiddleware();

  toastListener.startListening({
    actionCreator: addToast,
    effect: (action, listenerApi) => {
      const notification = action.payload;

      if (notification.type === "success") {
        toast.success(notification.message, {
          id: notification.id,
        });
      } else {
        toast.error(notification.message, {
          id: notification.id,
        });
      }

      listenerApi.dispatch(removeToast(notification.id));
    },
  });

  return configureStore({
    reducer: {
      services: servicesReducer,
      filters: filtersReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(toastListener.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];