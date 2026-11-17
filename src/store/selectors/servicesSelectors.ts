import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { ServiceFormValues } from "@/lib/validation/service";

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
export const selectSearch = (state: RootState) =>
  state.filters.search;

export const selectOperator = (state: RootState) =>
  state.filters.operator;

export const selectHasActiveFilters = createSelector(
  [selectSearch, selectOperator],
  (search, operator) =>
    search.trim().length > 0 || operator !== "all",
);

export const selectFilteredServices = createSelector(
  [selectServices, selectSearch, selectOperator],
  (services, search, operator) => {
    const normalizedSearch = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(normalizedSearch) ||
        service.provider.toLowerCase().includes(normalizedSearch);

      const matchesOperator =
        operator === "all" || service.operator === operator;

      return matchesSearch && matchesOperator;
    });
  },
);
export const selectServiceIsBusy = (
  state: RootState,
  id: number,
) =>
  Boolean(
    state.services.requests.toggleServiceStatus[id]?.loading ||
      state.services.requests.deleteService[id]?.loading,
  );

export const selectDeleteRequest = (
  state: RootState,
  id: number | null,
) =>
  id === null
    ? undefined
    : state.services.requests.deleteService[id];

export const selectServiceRequests = (state: RootState) =>
  state.services.requests;

export const selectSelectedService = (state: RootState) =>
  state.services.selectedService;

export const selectServiceDetailsId = (state: RootState) =>
  state.services.detailsId;

export const selectServiceDetailsRequest = (state: RootState) =>
  state.services.requests.fetchServiceById;

export const selectUpdateServiceRequest = (state: RootState) =>
  state.services.requests.updateService;

export const selectSelectedServiceFormValues = createSelector(
  [selectSelectedService],
  (service): ServiceFormValues | null => {
    if (!service) {
      return null;
    }

    return {
      name: service.name,
      provider: service.provider,
      category: service.category,
      description: service.description ?? "",
      operator: service.operator,
      price: service.price,
      cycle: service.cycle,
      trialDays: service.trialDays,
      keyword: service.keyword,
      shortcode: service.shortcode,
      notificationUrl: service.notificationUrl,
      sendWelcomeSms: service.sendWelcomeSms,
      status: service.status,
    };
  },
);