import { useState } from "react";

const FilterPanel = ({ onApplyFilters, onClearFilters, isLoading }) => {
  const [filters, setFilters] = useState({
    minScore: 0,
    maxScore: 100,
    keywords: "",
    excludeKeywords: "",
    minExperience: 0,
    maxExperience: 50,
    requiredSkills: "",
    educationLevel: "",
    sortBy: "score"
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      minScore: 0,
      maxScore: 100,
      keywords: "",
      excludeKeywords: "",
      minExperience: 0,
      maxExperience: 50,
      requiredSkills: "",
      educationLevel: "",
      sortBy: "score"
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Filter Toggle Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Advanced Filters</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition"
        >
          <svg
            className={`w-4 h-4 mr-2 transform transition-transform ${showFilters ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="space-y-4">
          {/* Score Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Score (%)
              </label>
              <input
                type="number"
                name="minScore"
                value={filters.minScore}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Score (%)
              </label>
              <input
                type="number"
                name="maxScore"
                value={filters.maxScore}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Experience Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Experience (years)
              </label>
              <input
                type="number"
                name="minExperience"
                value={filters.minExperience}
                onChange={handleInputChange}
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Experience (years)
              </label>
              <input
                type="number"
                name="maxExperience"
                value={filters.maxExperience}
                onChange={handleInputChange}
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Keywords
                <span className="text-xs text-gray-500 ml-1">(comma-separated)</span>
              </label>
              <input
                type="text"
                name="keywords"
                value={filters.keywords}
                onChange={handleInputChange}
                placeholder="e.g., React, Node.js, Python"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exclude Keywords
                <span className="text-xs text-gray-500 ml-1">(comma-separated)</span>
              </label>
              <input
                type="text"
                name="excludeKeywords"
                value={filters.excludeKeywords}
                onChange={handleInputChange}
                placeholder="e.g., fresher, intern"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
              <span className="text-xs text-gray-500 ml-1">(comma-separated, 70% match required)</span>
            </label>
            <input
              type="text"
              name="requiredSkills"
              value={filters.requiredSkills}
              onChange={handleInputChange}
              placeholder="e.g., JavaScript, MongoDB, Express"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Education Level and Sort By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Level
              </label>
              <select
                name="educationLevel"
                value={filters.educationLevel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Any</option>
                <option value="High School">High School</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor's">Bachelor's</option>
                <option value="Master's">Master's</option>
                <option value="PhD/Doctorate">PhD/Doctorate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="score">Match Score</option>
                <option value="experience">Experience</option>
                <option value="filename">Filename</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className={`flex items-center px-6 py-2 rounded-lg text-white font-medium transition ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-violet-600 hover:bg-violet-700'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Filtering...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Apply Filters
                </>
              )}
            </button>
            <button
              onClick={handleClearFilters}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
