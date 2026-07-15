import { configureStore } from "@reduxjs/toolkit";
import bundleReducer from "./bundleSlice";
import notificationsReducer from "./notificationsSlice";
import { persistenceMiddleware } from "./persistenceMiddleware";

export const store = configureStore({
  reducer: {
    bundle: bundleReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
});
