import React from "react";
import {
  Clock,
  Building2,
  Users,
  Package,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { getEventStatus, getConflicts } from "../utils/eventHelpers";

const EventCard = ({ event, events, onClick }) => {
  const status = getEventStatus(event, events);
  const conflicts = getConflicts(event, events);

  const borderColorClass =
    status === "complete"
      ? "border-l-green-500"
      : status === "conflict"
      ? "border-l-red-500"
      : "border-l-yellow-500";

  // กรอง role ที่มี required > 0 เท่านั้น
  const activeRoles = Object.entries(event.requiredStaff).filter(
    ([role, required]) => required > 0
  );

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 ${borderColorClass} border-l-4 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{event.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Clock className="w-4 h-4" />
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Building2 className="w-4 h-4" />
        <span>{event.company}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="flex items-center gap-1 text-gray-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="font-medium">Staff</span>
          </div>
          {activeRoles.map(([role, required]) => {
            const assigned = event.assignedStaff.filter((s) => s.role === role);
            const assignedCount = assigned.length;

            return (
              <div key={role} className="mb-2">
                <div className="text-xs text-gray-600 ml-5 font-medium">
                  {role}:{" "}
                  <span
                    className={
                      assignedCount < required
                        ? "text-red-600 font-medium"
                        : "text-green-600"
                    }
                  >
                    {assignedCount}/{required}
                  </span>
                </div>
                {assigned.length > 0 && (
                  <div className="ml-5 mt-1 flex flex-wrap gap-1">
                    {assigned.map((staff) => (
                      <span
                        key={staff.id}
                        className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200"
                      >
                        {staff.name}
                      </span>
                    ))}
                  </div>
                )}
                {assigned.length === 0 && (
                  <div className="text-xs text-red-500 ml-5 mt-0.5 italic">
                    ยังไม่มีคนในตำแหน่งนี้
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex items-center gap-1 text-gray-600 mb-1">
            <Package className="w-4 h-4" />
            <span className="font-medium">Equipment</span>
          </div>
          {event.requiredEquipment.slice(0, 2).map((eq) => {
            const assigned = event.assignedEquipment.find(
              (a) => a.category === eq.category
            );
            return (
              <div key={eq.category} className="text-xs text-gray-600 ml-5">
                {eq.category}:{" "}
                <span
                  className={
                    !assigned || assigned.assigned < eq.quantity
                      ? "text-red-600 font-medium"
                      : "text-green-600"
                  }
                >
                  {assigned?.assigned || 0}/{eq.quantity}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {status === "conflict" && conflicts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-red-200">
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
            <div className="flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">
                <div className="font-medium">Staff Conflict:</div>
                {conflicts.slice(0, 1).map((conflict, idx) => (
                  <div key={idx}>
                    With "{conflict.event.name}" -{" "}
                    {conflict.sharedStaff.map((s) => s.name).join(", ")}
                  </div>
                ))}
                {conflicts.length > 1 && (
                  <div className="mt-1">
                    +{conflicts.length - 1} more conflict(s)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {status === "incomplete" && (
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="flex items-start gap-1">
              <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-700">
                <span className="font-medium">Missing assignments</span> - Staff
                or equipment not fully assigned
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
