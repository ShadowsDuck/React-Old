import React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysInMonth, getEventsForDate } from "../utils/dateHelpers";
import { getEventStatus } from "../utils/eventHelpers";

const CalendarGrid = ({
  currentDate,
  selectedDate,
  events,
  onNavigateMonth,
  onGoToToday,
  onSelectDate,
}) => {
  const getDayColor = (date) => {
    if (!date) return "";
    const dayEvents = getEventsForDate(date, events);
    if (dayEvents.length === 0) return "";

    const hasConflict = dayEvents.some(
      (e) => getEventStatus(e, events) === "conflict"
    );
    if (hasConflict) return "bg-red-100 border-red-300";

    const allComplete = dayEvents.every(
      (e) => getEventStatus(e, events) === "complete"
    );
    if (allComplete) return "bg-green-100 border-green-300";

    return "bg-yellow-100 border-yellow-300";
  };

  return (
    <div>
      {/* Calendar Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold ml-2">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
          </div>

          <button
            onClick={onGoToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-3 text-center font-semibold text-gray-700 bg-gray-50"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {getDaysInMonth(currentDate).map((date, idx) => {
            const dayEvents = date ? getEventsForDate(date, events) : [];
            const isToday =
              date &&
              date.toDateString() === new Date(2025, 10, 15).toDateString();
            const isSelected =
              date &&
              selectedDate &&
              date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={idx}
                onClick={() => date && onSelectDate(date)}
                className={`min-h-24 p-2 border-r border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  !date ? "bg-gray-50" : ""
                } ${getDayColor(date)} ${
                  isToday ? "ring-2 ring-blue-500 ring-inset" : ""
                } ${isSelected ? "ring-2 ring-purple-500 ring-inset" : ""}`}
              >
                {date && (
                  <div>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="space-y-1">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium text-center">
                          {dayEvents.length} event
                          {dayEvents.length !== 1 ? "s" : ""}
                        </div>
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs bg-white border border-gray-200 rounded px-1 py-0.5 truncate"
                            title={event.name}
                          >
                            {event.startTime} {event.name}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-sm text-gray-700">All Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span className="text-sm text-gray-700">Partially Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="text-sm text-gray-700">Conflicts Detected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
