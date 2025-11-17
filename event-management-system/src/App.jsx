import React, { useState, useMemo } from "react";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Users,
  Building2,
  Briefcase,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  generateMockEvents,
  getAllStaff,
  getAllCompanies,
  getAllEventTypes,
} from "./utils/mockData";
import { getEventsForDate } from "./utils/dateHelpers";
import { useEventFilters } from "./hooks/useEventFilters";
import StatusBadge from "./components/StatusBadge";
import MultiSelectFilter from "./components/MultiSelectFilter";
import EventCard from "./components/EventCard";
import CalendarGrid from "./components/CalendarGrid";
import EventDetailDrawer from "./components/EventDetailDrawer";

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 15));
  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 15));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [events, setEvents] = useState(generateMockEvents());

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [eventTypeSearchTerm, setEventTypeSearchTerm] = useState("");

  // Get unique values for filters
  const allStaff = useMemo(() => getAllStaff(events), [events]);
  const allCompanies = useMemo(() => getAllCompanies(events), [events]);
  const allEventTypes = useMemo(() => getAllEventTypes(events), [events]);

  // Filter events
  const filteredEvents = useEventFilters(events, {
    searchTerm,
    selectedStaff,
    selectedCompanies,
    selectedEventTypes,
    selectedStatuses,
  });

  // Handle event update (for staff reassignment)
  const handleUpdateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date(2025, 10, 15);
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Multi-select filter handlers
  const toggleStaffFilter = (staffId) => {
    setSelectedStaff((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const toggleCompanyFilter = (company) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
  };

  const toggleEventTypeFilter = (eventType) => {
    setSelectedEventTypes((prev) =>
      prev.includes(eventType)
        ? prev.filter((t) => t !== eventType)
        : [...prev, eventType]
    );
  };

  const toggleStatusFilter = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedStaff([]);
    setSelectedCompanies([]);
    setSelectedEventTypes([]);
    setSelectedStatuses([]);
    setStaffSearchTerm("");
    setCompanySearchTerm("");
    setEventTypeSearchTerm("");
  };

  // Filtered options for dropdowns
  const filteredStaffOptions = allStaff.filter((staff) =>
    staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

  const filteredCompanyOptions = allCompanies.filter((company) =>
    company.toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  const filteredEventTypeOptions = allEventTypes.filter((type) =>
    type.toLowerCase().includes(eventTypeSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Event Management System
            </h1>

            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              Quick Add Event
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("calendar")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === "calendar"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Calendar View
              </button>
              <button
                onClick={() => setView("daily")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === "daily"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Daily Card View
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
              {selectedStaff.length +
                selectedCompanies.length +
                selectedEventTypes.length +
                selectedStatuses.length >
                0 && (
                <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {selectedStaff.length +
                    selectedCompanies.length +
                    selectedEventTypes.length +
                    selectedStatuses.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events, companies, or staff..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Multi-select filters */}
              <MultiSelectFilter
                label="Staff"
                options={filteredStaffOptions}
                selected={selectedStaff}
                onToggle={toggleStaffFilter}
                searchTerm={staffSearchTerm}
                onSearchChange={setStaffSearchTerm}
                icon={Users}
              />

              <MultiSelectFilter
                label="Company"
                options={filteredCompanyOptions}
                selected={selectedCompanies}
                onToggle={toggleCompanyFilter}
                searchTerm={companySearchTerm}
                onSearchChange={setCompanySearchTerm}
                icon={Building2}
              />

              <MultiSelectFilter
                label="Event Type"
                options={filteredEventTypeOptions}
                selected={selectedEventTypes}
                onToggle={toggleEventTypeFilter}
                searchTerm={eventTypeSearchTerm}
                onSearchChange={setEventTypeSearchTerm}
                icon={Briefcase}
              />

              {/* Status Filter */}
              <MultiSelectFilter
                label="Status"
                options={["complete", "incomplete", "conflict"]}
                selected={selectedStatuses}
                onToggle={toggleStatusFilter}
                searchTerm=""
                onSearchChange={() => {}}
                icon={AlertCircle}
              />

              {/* Clear All */}
              {(searchTerm ||
                selectedStaff.length > 0 ||
                selectedCompanies.length > 0 ||
                selectedEventTypes.length > 0 ||
                selectedStatuses.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Active Filters Display */}
            {(selectedStaff.length > 0 ||
              selectedCompanies.length > 0 ||
              selectedEventTypes.length > 0 ||
              selectedStatuses.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {selectedStaff.map((staffId) => {
                  const staff = allStaff.find((s) => s.id === staffId);
                  return staff ? (
                    <span
                      key={staffId}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                      {staff.name}
                      <button
                        onClick={() => toggleStaffFilter(staffId)}
                        className="hover:bg-blue-200 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
                {selectedCompanies.map((company) => (
                  <span
                    key={company}
                    className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                  >
                    {company}
                    <button
                      onClick={() => toggleCompanyFilter(company)}
                      className="hover:bg-purple-200 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedEventTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                  >
                    {type}
                    <button
                      onClick={() => toggleEventTypeFilter(type)}
                      className="hover:bg-green-200 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedStatuses.map((status) => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs capitalize"
                  >
                    {status}
                    <button
                      onClick={() => toggleStatusFilter(status)}
                      className="hover:bg-gray-200 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {view === "calendar" ? (
          <CalendarGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={filteredEvents}
            onNavigateMonth={navigateMonth}
            onGoToToday={goToToday}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setView("daily");
            }}
          />
        ) : (
          <div>
            {/* Daily View Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(selectedDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(selectedDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {getEventsForDate(selectedDate, filteredEvents).length}{" "}
                      event
                      {getEventsForDate(selectedDate, filteredEvents).length !==
                      1
                        ? "s"
                        : ""}{" "}
                      scheduled
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setView("calendar")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Calendar View
                  </button>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            {getEventsForDate(selectedDate, filteredEvents).length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No events scheduled
                </h3>
                <p className="text-gray-600 mb-4">
                  There are no events on this date.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getEventsForDate(selectedDate, filteredEvents).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    events={events}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Detail Drawer */}
      {selectedEvent && (
        <EventDetailDrawer
          event={selectedEvent}
          events={events}
          onClose={() => setSelectedEvent(null)}
          onUpdateEvent={handleUpdateEvent}
        />
      )}

      {/* Results Count */}
      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2 border border-gray-200">
        <span className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredEvents.length}
          </span>{" "}
          of {events.length} events
        </span>
      </div>
    </div>
  );
};

export default App;
