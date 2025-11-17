export const getEventStatus = (event, events) => {
  const hasConflict = checkConflicts(event, events);
  if (hasConflict) return "conflict";

  const staffComplete = Object.entries(event.requiredStaff)
    .filter(([role, required]) => required > 0)
    .every(([role, required]) => {
      const assigned = event.assignedStaff.filter(
        (s) => s.role === role
      ).length;
      return assigned >= required;
    });

  const equipmentComplete = event.requiredEquipment
    .filter((eq) => eq.quantity > 0)
    .every((eq) => {
      const assigned = event.assignedEquipment.find(
        (a) => a.category === eq.category
      );
      return assigned && assigned.assigned >= eq.quantity;
    });

  if (staffComplete && equipmentComplete) return "complete";
  return "incomplete";
};

export const getConflicts = (event, events) => {
  const eventsOnSameDay = events.filter(
    (e) =>
      e.id !== event.id && e.date.toDateString() === event.date.toDateString()
  );

  const conflicts = [];
  for (const otherEvent of eventsOnSameDay) {
    const timeOverlap =
      event.startTime < otherEvent.endTime &&
      event.endTime > otherEvent.startTime;
    if (timeOverlap) {
      const sharedStaff = event.assignedStaff.filter((s1) =>
        otherEvent.assignedStaff.some((s2) => s1.id === s2.id)
      );
      if (sharedStaff.length > 0) {
        conflicts.push({ event: otherEvent, sharedStaff });
      }
    }
  }
  return conflicts;
};

export const checkConflicts = (event, events) => {
  return getConflicts(event, events).length > 0;
};

export const getAvailableStaff = (event, allStaff, events) => {
  const eventsOnSameDay = events.filter(
    (e) =>
      e.id !== event.id && e.date.toDateString() === event.date.toDateString()
  );

  return allStaff.map((staff) => {
    const conflictingEvents = eventsOnSameDay.filter((otherEvent) => {
      const timeOverlap =
        event.startTime < otherEvent.endTime &&
        event.endTime > otherEvent.startTime;
      const isAssigned = otherEvent.assignedStaff.some(
        (s) => s.id === staff.id
      );
      return timeOverlap && isAssigned;
    });

    return {
      ...staff,
      available: conflictingEvents.length === 0,
      conflictingEvents,
    };
  });
};
