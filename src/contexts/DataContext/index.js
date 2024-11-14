import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

const DataContext = createContext({});

export const api = {
  loadData: async () => {
    const json = await fetch("/events.json");
    return json.json();
  },
};

export const DataProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const getData = useCallback(async () => {
    try {
      setData(await api.loadData());
    } catch (err) {
      setError(err);
    }
  }, []);

  useEffect(() => {
    if (data) return;
    getData();
  }, [data, getData]);

  // Calculer le dernier événement avec useMemo pour éviter les recalculs
  const lastEvent = useMemo(() => {
    if (data && data.events && data.events.length > 0) {
      return data.events.reduce((latest, current) => {
        const latestDate = new Date(latest.date);
        const currentDate = new Date(current.date);
        return currentDate > latestDate ? current : latest;
      });
    }
    return null;
  }, [data]);

  return (
    <DataContext.Provider
      value={{
        data,
        error,
        lastEvent, // Exposez lastEvent dans le contexte
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useData = () => useContext(DataContext);

export default DataContext;
