import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Building2,
  Briefcase,
  Users,
  AlertTriangle,
  Search,
  PlusCircle,
  Trash2,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { getEventStatus, getAvailableStaff } from "../utils/eventHelpers";
import { getAllStaff } from "../utils/mockData";

// A predefined list of all possible roles you can add.
const ALL_POSSIBLE_ROLES = [
  "Host",
  "Cameraman",
  "Technician",
  "Sound Engineer",
  "Producer",
  "Director",
  "Lighting",
];

// Modal Component for Assigning Staff
const AssignStaffModal = ({
  isOpen,
  onClose,
  onAssign,
  role,
  event,
  events,
  allStaff,
}) => {
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  useEffect(() => {
    if (isOpen) {
      setSelectedStaffIds([]);
      setSearchTerm("");
      setAvailabilityFilter("all");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requiredCount = event.requiredStaff[role];
  const assignedStaffForRole = event.assignedStaff.filter(
    (s) => s.role === role
  );
  const maxAssignments = requiredCount - assignedStaffForRole.length;

  const availableStaffForRole = getAvailableStaff(
    event,
    allStaff.filter((s) => s.role === role),
    events
  );
  const uniqueStaff = availableStaffForRole.filter(
    (staff, index, self) => index === self.findIndex((s) => s.id === staff.id)
  );
  const assignedStaffIds = event.assignedStaff.map((s) => s.id);

  const filteredStaff = uniqueStaff.filter((staff) => {
    if (assignedStaffIds.includes(staff.id)) return false;
    const matchesSearch = staff.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (availabilityFilter === "available") return staff.available;
    if (availabilityFilter === "busy") return !staff.available;
    return true;
  });

  const handleToggleSelection = (staffId) => {
    setSelectedStaffIds((prev) => {
      if (prev.includes(staffId)) {
        return prev.filter((id) => id !== staffId);
      } else {
        if (prev.length >= maxAssignments) return prev;
        return [...prev, staffId];
      }
    });
  };

  const handleConfirmAssignment = () => {
    const staffToAssign = allStaff.filter((s) =>
      selectedStaffIds.includes(s.id)
    );
    onAssign(staffToAssign);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Assign Staff for {role}
          </h3>
          <p className="text-sm text-gray-600">
            You can select up to {maxAssignments} more people.
          </p>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAvailabilityFilter("all")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border ${
                availabilityFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAvailabilityFilter("available")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border ${
                availabilityFilter === "available"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setAvailabilityFilter("busy")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border ${
                availabilityFilter === "busy"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Busy
            </button>
          </div>
        </div>

        <div className="p-4 flex-grow overflow-y-auto max-h-[40vh] space-y-2">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No staff available
            </div>
          ) : (
            filteredStaff.map((staff) => {
              const isSelected = selectedStaffIds.includes(staff.id);
              const isDisabled =
                !isSelected && selectedStaffIds.length >= maxAssignments;
              return (
                <div
                  key={staff.id}
                  onClick={() => !isDisabled && handleToggleSelection(staff.id)}
                  className={`p-3 rounded border flex items-center justify-between cursor-pointer transition-all ${
                    isDisabled
                      ? "bg-gray-100 opacity-60 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-100 border-blue-400"
                      : staff.available
                      ? "bg-green-50 border-green-200 hover:bg-green-100"
                      : "bg-red-50 border-red-200 hover:bg-red-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium">{staff.name}</span>
                      {!staff.available &&
                        staff.conflictingEvents.length > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            Busy:{" "}
                            {staff.conflictingEvents
                              .map((e) => e.name)
                              .join(", ")}
                          </div>
                        )}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      staff.available
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {staff.available ? "Available" : "Busy"}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAssignment}
            disabled={selectedStaffIds.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Assign ({selectedStaffIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

const EventDetailDrawer = ({ event, events, onClose, onUpdateEvent }) => {
  if (!event) return null;

  const [localEvent, setLocalEvent] = useState(event);
  const [moveStaffConfirm, setMoveStaffConfirm] = useState(null);
  const [selectedStaffToMove, setSelectedStaffToMove] = useState([]);
  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCount, setNewRoleCount] = useState(1);
  const [assignModalState, setAssignModalState] = useState({
    isOpen: false,
    role: null,
  });

  useEffect(() => {
    setLocalEvent(event);
  }, [event]);

  // Helper functions for time conversion and overlap checking
  const timeToMinutes = (timeStr) => {
    if (!timeStr || !timeStr.includes(":")) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const timesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  // [NEW] Calculate detailed conflicts using useMemo for performance
  const detailedConflicts = useMemo(() => {
    const conflicts = [];
    if (!localEvent || !events) return conflicts;

    const eventStart = timeToMinutes(localEvent.startTime);
    const eventEnd = timeToMinutes(localEvent.endTime);

    for (const assignedStaff of localEvent.assignedStaff) {
      const conflictingEvents = events.filter((otherEvent) => {
        if (otherEvent.id === localEvent.id) return false;

        const isStaffInOtherEvent = otherEvent.assignedStaff.some(
          (s) => s.id === assignedStaff.id
        );
        if (!isStaffInOtherEvent) return false;

        const datesMatch =
          otherEvent.date.toDateString() === localEvent.date.toDateString();
        if (!datesMatch) return false;

        const otherEventStart = timeToMinutes(otherEvent.startTime);
        const otherEventEnd = timeToMinutes(otherEvent.endTime);

        return timesOverlap(
          eventStart,
          eventEnd,
          otherEventStart,
          otherEventEnd
        );
      });

      if (conflictingEvents.length > 0) {
        conflicts.push({
          staff: assignedStaff,
          conflictingEvents: conflictingEvents,
        });
      }
    }
    return conflicts;
  }, [localEvent, events]);

  // When the move staff confirmation modal opens, initialize the selection state
  useEffect(() => {
    if (moveStaffConfirm && moveStaffConfirm.staffList) {
      setSelectedStaffToMove(
        moveStaffConfirm.staffList.map((item) => item.staff.id)
      );
    }
  }, [moveStaffConfirm]);

  const availableRolesToAdd = ALL_POSSIBLE_ROLES.filter(
    (role) => !localEvent.requiredStaff.hasOwnProperty(role)
  );
  useEffect(() => {
    if (availableRolesToAdd.length > 0) {
      setNewRoleName(availableRolesToAdd[0]);
    } else {
      setNewRoleName("");
    }
  }, [localEvent.requiredStaff]);

  const status = getEventStatus(localEvent, events);
  const allStaff = getAllStaff(events);

  const handleUnassignStaff = (staff) => {
    const newAssignedStaff = localEvent.assignedStaff.filter(
      (s) => s.id !== staff.id
    );
    const updatedEvent = { ...localEvent, assignedStaff: newAssignedStaff };
    setLocalEvent(updatedEvent);
    if (onUpdateEvent) onUpdateEvent(updatedEvent);
  };

  const handleClearAllForRole = (roleToClear) => {
    const newAssignedStaff = localEvent.assignedStaff.filter(
      (s) => s.role !== roleToClear
    );
    const updatedEvent = { ...localEvent, assignedStaff: newAssignedStaff };
    setLocalEvent(updatedEvent);
    if (onUpdateEvent) onUpdateEvent(updatedEvent);
  };

  const handleAssignStaff = (staffList) => {
    const { role } = assignModalState;
    if (!role) return;

    const staffToAssign = staffList.map((staff) => ({
      ...staff,
      role: role,
    }));

    const staffWithConflicts = staffToAssign
      .map((staff) => {
        const event1Start = timeToMinutes(localEvent.startTime);
        const event1End = timeToMinutes(localEvent.endTime);

        const conflictingEvents = events.filter((e) => {
          if (e.id === localEvent.id) return false;
          if (!e.assignedStaff.some((s) => s.id === staff.id)) return false;
          if (e.date.toDateString() !== localEvent.date.toDateString())
            return false;

          const event2Start = timeToMinutes(e.startTime);
          const event2End = timeToMinutes(e.endTime);
          return timesOverlap(event1Start, event1End, event2Start, event2End);
        });

        return { staff, conflictingEvents };
      })
      .filter((item) => item.conflictingEvents.length > 0);

    const availableStaff = staffToAssign.filter(
      (s) => !staffWithConflicts.some((c) => c.staff.id === s.id)
    );

    if (availableStaff.length > 0) {
      const updatedAssignedStaff = [
        ...localEvent.assignedStaff,
        ...availableStaff,
      ];
      const updatedEvent = {
        ...localEvent,
        assignedStaff: updatedAssignedStaff,
      };
      setLocalEvent(updatedEvent);
      if (onUpdateEvent) {
        onUpdateEvent(updatedEvent);
      }
    }

    if (staffWithConflicts.length > 0) {
      setMoveStaffConfirm({ staffList: staffWithConflicts });
    }
  };

  const confirmMoveStaff = () => {
    if (!moveStaffConfirm || !moveStaffConfirm.staffList) return;

    const staffToMove = moveStaffConfirm.staffList.filter(({ staff }) =>
      selectedStaffToMove.includes(staff.id)
    );

    if (staffToMove.length === 0) {
      setMoveStaffConfirm(null);
      return;
    }

    const eventsToUpdate = new Map();

    staffToMove.forEach(({ staff, conflictingEvents }) => {
      conflictingEvents.forEach((conflictingEvent) => {
        if (!eventsToUpdate.has(conflictingEvent.id)) {
          eventsToUpdate.set(conflictingEvent.id, {
            ...conflictingEvent,
            assignedStaff: [...conflictingEvent.assignedStaff],
          });
        }

        const eventToUpdate = eventsToUpdate.get(conflictingEvent.id);
        eventToUpdate.assignedStaff = eventToUpdate.assignedStaff.filter(
          (s) => s.id !== staff.id
        );
      });
    });

    eventsToUpdate.forEach((updatedEvent) => {
      if (onUpdateEvent) onUpdateEvent(updatedEvent);
    });

    const staffToAdd = staffToMove.map((item) => item.staff);
    const newAssignedStaff = [...localEvent.assignedStaff, ...staffToAdd];
    const updatedEvent = { ...localEvent, assignedStaff: newAssignedStaff };
    setLocalEvent(updatedEvent);
    if (onUpdateEvent) onUpdateEvent(updatedEvent);

    setMoveStaffConfirm(null);
    setSelectedStaffToMove([]);
  };

  const handleUpdateRequiredCount = (role, newCount, assignedCount) => {
    if (newCount < assignedCount) return;
    if (newCount < 0) return;

    if (newCount === 0) {
      setDeleteRoleConfirm({ role });
      return;
    }

    const updatedRequiredStaff = {
      ...localEvent.requiredStaff,
      [role]: newCount,
    };
    const updatedEvent = { ...localEvent, requiredStaff: updatedRequiredStaff };
    setLocalEvent(updatedEvent);
    if (onUpdateEvent) onUpdateEvent(updatedEvent);
  };

  const handleConfirmDeleteRole = () => {
    if (!deleteRoleConfirm) return;
    const { role } = deleteRoleConfirm;
    const { [role]: _, ...remainingRoles } = localEvent.requiredStaff;
    const newAssignedStaff = localEvent.assignedStaff.filter(
      (s) => s.role !== role
    );
    const updatedEvent = {
      ...localEvent,
      requiredStaff: remainingRoles,
      assignedStaff: newAssignedStaff,
    };
    setLocalEvent(updatedEvent);
    if (onUpdateEvent) onUpdateEvent(updatedEvent);
    setDeleteRoleConfirm(null);
  };

  const handleAddNewRole = () => {
    if (!newRoleName || newRoleCount <= 0) return;
    const updatedRequiredStaff = {
      ...localEvent.requiredStaff,
      [newRoleName]: newRoleCount,
    };
    const updatedEvent = { ...localEvent, requiredStaff: updatedRequiredStaff };
    setLocalEvent(updatedEvent);
    if (onUpdateEvent) onUpdateEvent(updatedEvent);
    setNewRoleName("");
    setNewRoleCount(1);
  };

  const handleToggleStaffToMove = (staffId) => {
    setSelectedStaffToMove((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleToggleSelectAllStaffToMove = () => {
    if (selectedStaffToMove.length === moveStaffConfirm.staffList.length) {
      setSelectedStaffToMove([]);
    } else {
      setSelectedStaffToMove(
        moveStaffConfirm.staffList.map((item) => item.staff.id)
      );
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-end"
        onClick={onClose}
      >
        <div
          className="bg-white h-full w-full max-w-3xl overflow-y-auto shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {localEvent.name}
              </h2>
              <p className="text-sm text-gray-600">
                {localEvent.date.toLocaleDateString()} • {localEvent.startTime}{" "}
                - {localEvent.endTime}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{localEvent.company}</span>
              </div>
              <StatusBadge status={status} />
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-5 h-5" />
              <span>{localEvent.eventType}</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Assigned Staff Summary
              </h3>
              <div className="space-y-2">
                {Object.entries(localEvent.requiredStaff)
                  .filter(([, required]) => required > 0)
                  .map(([role, required]) => {
                    const assigned = localEvent.assignedStaff.filter(
                      (s) => s.role === role
                    );
                    const isComplete = assigned.length >= required;
                    return (
                      <div key={role} className="bg-white rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {role}
                          </span>
                          <span
                            className={`text-sm px-2 py-1 rounded ${
                              isComplete
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {assigned.length}/{required}
                          </span>
                        </div>
                        {assigned.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assigned.map((staff) => (
                              <span
                                key={staff.id}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {staff.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-red-600 italic">
                            No staff assigned
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* [UPDATED] "Conflicts Detected" Box with Details */}
            {detailedConflicts.length > 0 && (
              <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Staffing Conflicts Found
                </h3>
                <div className="space-y-4">
                  {detailedConflicts.map(({ staff, conflictingEvents }) => (
                    <div
                      key={staff.id}
                      className="bg-white p-3 rounded-md border border-yellow-200"
                    >
                      <div className="font-semibold text-gray-800">
                        {staff.name}{" "}
                        <span className="text-sm text-gray-500 font-normal">
                          ({staff.role})
                        </span>
                      </div>
                      <div className="mt-2 pl-4">
                        {conflictingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="text-sm text-red-700 relative pl-4 before:content-['-'] before:absolute before:left-0"
                          >
                            <span>
                              Conflicts with: <strong>{event.name}</strong>
                            </span>
                            <span className="block text-xs text-red-500">
                              ({event.startTime} - {event.endTime})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === "incomplete" && detailedConflicts.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Incomplete Staffing
                </h3>
                <p className="text-sm text-yellow-700">
                  This event needs more staff assigned.
                </p>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Staff Assignment
              </h3>
              <div className="space-y-4">
                {Object.entries(localEvent.requiredStaff)
                  .filter(([, required]) => required > 0)
                  .map(([role, required]) => {
                    const assigned = localEvent.assignedStaff.filter(
                      (s) => s.role === role
                    );
                    const isComplete = assigned.length >= required;
                    const roleHasConflict = assigned.some((s) =>
                      detailedConflicts.some((c) => c.staff.id === s.id)
                    );

                    return (
                      <div
                        key={role}
                        className={`border-2 rounded-lg p-4 transition-colors ${
                          isComplete && !roleHasConflict
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900 text-lg">
                              {role}
                            </span>
                            <span className="text-sm text-gray-600">
                              ({assigned.length} จาก {required} คน)
                            </span>
                            {!isComplete ? (
                              <span className="text-xs border border-red-600 text-red-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                ✗ ยังไม่ครบ
                              </span>
                            ) : roleHasConflict ? (
                              <span className="text-xs border border-yellow-600 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                ✗ เกิดการทับซ้อน
                              </span>
                            ) : (
                              <span className="text-xs border border-green-600 text-green-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                ✓ ครบแล้ว
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {assigned.length > 0 && (
                              <button
                                onClick={() => handleClearAllForRole(role)}
                                className="text-xs px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 font-medium"
                              >
                                Clear All
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteRoleConfirm({ role })}
                              className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                            >
                              Delete Role
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          {Array.from({ length: required }).map((_, index) => {
                            const assignedStaff = assigned[index];

                            const staffConflictDetails = assignedStaff
                              ? detailedConflicts.find(
                                  (c) => c.staff.id === assignedStaff.id
                                )
                              : null;

                            return (
                              <div
                                key={index}
                                className={`bg-white rounded-lg border p-3 flex items-center justify-between ${
                                  staffConflictDetails
                                    ? "border-red-400 border-2"
                                    : "border-gray-300"
                                }`}
                              >
                                {assignedStaff ? (
                                  <>
                                    <div className="flex flex-col flex-grow">
                                      <span
                                        className={`text-sm font-medium ${
                                          staffConflictDetails
                                            ? "text-red-700"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {`Slot ${index + 1}: ${
                                          assignedStaff.name
                                        }`}
                                      </span>
                                      {staffConflictDetails && (
                                        <span className="text-xs text-red-600 mt-1">
                                          (Conflict:{" "}
                                          {staffConflictDetails.conflictingEvents
                                            .map((e) => e.name)
                                            .join(", ")}
                                          )
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleUnassignStaff(assignedStaff)
                                      }
                                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium ml-2"
                                    >
                                      Clear
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        setAssignModalState({
                                          isOpen: true,
                                          role,
                                        })
                                      }
                                      className="text-sm text-gray-500 hover:text-blue-600 w-full text-left"
                                    >
                                      {`Slot ${index + 1}: ว่าง`}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateRequiredCount(
                                          role,
                                          required - 1,
                                          assigned.length
                                        );
                                      }}
                                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                                      title="Delete Slot"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-3 border-t border-gray-300">
                          <button
                            onClick={() =>
                              handleUpdateRequiredCount(
                                role,
                                required + 1,
                                assigned.length
                              )
                            }
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <PlusCircle size={16} />
                            Add More Slot
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="text-md font-semibold text-gray-800 mb-2">
                  Add New Role
                </h4>
                <div className="flex items-center gap-2">
                  <select
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-lg text-sm"
                    disabled={availableRolesToAdd.length === 0}
                  >
                    {availableRolesToAdd.length > 0 ? (
                      availableRolesToAdd.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))
                    ) : (
                      <option>No more roles</option>
                    )}
                  </select>
                  <input
                    type="number"
                    value={newRoleCount}
                    onChange={(e) =>
                      setNewRoleCount(
                        Math.max(1, parseInt(e.target.value, 10) || 1)
                      )
                    }
                    min="1"
                    className="w-20 p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddNewRole}
                    disabled={!newRoleName || newRoleCount <= 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add Role
                  </button>
                </div>
                {availableRolesToAdd.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    All possible roles have been added.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AssignStaffModal
        isOpen={assignModalState.isOpen}
        onClose={() => setAssignModalState({ isOpen: false, role: null })}
        onAssign={handleAssignStaff}
        role={assignModalState.role}
        event={localEvent}
        events={events}
        allStaff={allStaff}
      />

      {moveStaffConfirm && moveStaffConfirm.staffList && (
        <div className="fixed inset-0 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Move Staff Member
                  {moveStaffConfirm.staffList.length > 1 ? "s" : ""}?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  The following staff{" "}
                  {moveStaffConfirm.staffList.length > 1 ? "are" : "is"}{" "}
                  currently assigned to conflicting events. Select who to move.
                </p>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={
                    selectedStaffToMove.length ===
                      moveStaffConfirm.staffList.length &&
                    moveStaffConfirm.staffList.length > 0
                  }
                  onChange={handleToggleSelectAllStaffToMove}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-sm text-gray-800">
                  Select All
                </span>
              </label>

              {moveStaffConfirm.staffList.map(
                ({ staff, conflictingEvents }) => (
                  <label
                    key={staff.id}
                    htmlFor={`staff-move-${staff.id}`}
                    className="block border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`staff-move-${staff.id}`}
                        checked={selectedStaffToMove.includes(staff.id)}
                        onChange={() => handleToggleStaffToMove(staff.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">
                          {staff.name}
                        </span>
                        <div className="space-y-2 mt-2">
                          {conflictingEvents.map(
                            (conflictEvent, conflictIdx) => (
                              <div
                                key={conflictIdx}
                                className="p-2 bg-red-50 rounded-lg border border-red-200"
                              >
                                <div className="text-sm font-medium text-red-900">
                                  {conflictEvent.name}
                                </div>
                                <div className="text-xs text-red-700 mt-1">
                                  {conflictEvent.date.toLocaleDateString()} •{" "}
                                  {conflictEvent.startTime} -{" "}
                                  {conflictEvent.endTime}
                                </div>
                                <div className="text-xs text-red-700 mt-1">
                                  Company: {conflictEvent.company}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                )
              )}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <div className="text-sm font-medium text-blue-900">Move to:</div>
              <div className="text-sm text-blue-800 mt-1">
                {localEvent.name}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {localEvent.date.toLocaleDateString()} • {localEvent.startTime}{" "}
                - {localEvent.endTime}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              <strong className="text-red-600">Warning:</strong> This will
              unassign the selected staff from their current events and move
              them here.
            </p>

            <div className="flex gap-3 mt-auto pt-4 border-t">
              <button
                onClick={() => {
                  setMoveStaffConfirm(null);
                  setSelectedStaffToMove([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmMoveStaff}
                disabled={selectedStaffToMove.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Confirm Move ({selectedStaffToMove.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteRoleConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Role?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to remove the{" "}
                  <strong>{deleteRoleConfirm.role}</strong> role? Any assigned
                  staff will be unassigned.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteRoleConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteRole}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventDetailDrawer;
