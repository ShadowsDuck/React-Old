import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const MultiSelectFilter = ({
  label,
  options,
  selected,
  onToggle,
  searchTerm,
  onSearchChange,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 ${
          selected.length > 0 ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
        {selected.length > 0 && (
          <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
            {selected.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {options.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No results found
              </div>
            ) : (
              options.map((option, idx) => {
                const value = option.id || option;
                const display = option.name
                  ? `${option.name} (${option.role})`
                  : option;

                return (
                  <label
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(value)}
                      onChange={() => onToggle(value)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm flex-1">{display}</span>
                  </label>
                );
              })
            )}
          </div>
          <div className="p-2 border-t bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectFilter;
