import { createContext, useState, useContext } from 'react';

const ShortlistContext = createContext();

export const ShortlistProvider = ({ children }) => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({}); // <-- New state for filters

  const value = {
    selectedCandidates,
    setSelectedCandidates,
    currentJobId,
    setCurrentJobId,
    currentFilters, 
    setCurrentFilters, // <-- New function to set the filters
  };

  return (
    <ShortlistContext.Provider value={value}>
      {children}
    </ShortlistContext.Provider>
  );
};

export const useShortlist = () => {
  return useContext(ShortlistContext);
};
