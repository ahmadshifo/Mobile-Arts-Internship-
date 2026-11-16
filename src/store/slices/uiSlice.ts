import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";

type ToastInput = {
  message: string;
  type: "success" | "error";
};

type ToastNotification = ToastInput & {
  id: string;
};

type UiState = {
  toasts: ToastNotification[];
};

const initialState: UiState = {
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addToast: {
      reducer(state, action: PayloadAction<ToastNotification>) {
        state.toasts.push(action.payload);
      },

      prepare(notification: ToastInput) {
        return {
          payload: {
            ...notification,
            id: nanoid(),
          },
        };
      },
    },

    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload,
      );
    },
  },
});

export const { addToast, removeToast } = uiSlice.actions;

export default uiSlice.reducer;