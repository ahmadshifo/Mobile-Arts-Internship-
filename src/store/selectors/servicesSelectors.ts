import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

export const selectServices = (state: RootState) =>
  state.services.items;

export const selectServicesRequest = (state: RootState) =>
  state.services.requests.fetchServices;

export const selectServicesHasLoaded = (state: RootState) =>
  state.services.hasLoaded;

export const selectServicesSummary = createSelector(
  [selectServices],
  (services) => ({
    total: services.length,
    active: services.filter((service) => service.status === "Active").length,
  }),
);