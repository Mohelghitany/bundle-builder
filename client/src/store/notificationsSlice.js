import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notify: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ message, tone = "info", duration = 4000 }) {
        return { payload: { id: nanoid(), message, tone, duration } };
      },
    },
    dismiss(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearAll(state) {
      state.items = [];
    },
  },
});

export const { notify, dismiss, clearAll } = notificationsSlice.actions;

export const notifySuccess = (message, duration) =>
  notify({ message, tone: "success", duration });
export const notifyError = (message, duration) =>
  notify({ message, tone: "error", duration });

export const selectNotifications = (state) => state.notifications.items;

export default notificationsSlice.reducer;
