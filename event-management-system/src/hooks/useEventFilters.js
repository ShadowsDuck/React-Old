import { useMemo } from "react";
import { getEventStatus } from "../utils/eventHelpers";

export const useEventFilters = (events, filters) => {
  const {
    searchTerm,
    selectedStaff,
    selectedCompanies,
    selectedEventTypes,
    selectedStatuses,
  } = filters;

  return useMemo(() => {
    return events.filter((event) => {
      // Search term
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          event.name.toLowerCase().includes(search) ||
          event.company.toLowerCase().includes(search) ||
          event.assignedStaff.some((s) =>
            s.name.toLowerCase().includes(search)
          );
        if (!matchesSearch) return false;
      }

      // Staff filter
      if (selectedStaff.length > 0) {
        const hasSelectedStaff = selectedStaff.some((staffId) =>
          event.assignedStaff.some((s) => s.id === staffId)
        );
        if (!hasSelectedStaff) return false;
      }

      // Company filter
      if (
        selectedCompanies.length > 0 &&
        !selectedCompanies.includes(event.company)
      ) {
        return false;
      }

      // Event type filter
      if (
        selectedEventTypes.length > 0 &&
        !selectedEventTypes.includes(event.eventType)
      ) {
        return false;
      }

      // Status filter
      if (selectedStatuses.length > 0) {
        const status = getEventStatus(event, events);
        if (!selectedStatuses.includes(status)) return false;
      }

      return true;
    });
  }, [
    events,
    searchTerm,
    selectedStaff,
    selectedCompanies,
    selectedEventTypes,
    selectedStatuses,
  ]);
};
