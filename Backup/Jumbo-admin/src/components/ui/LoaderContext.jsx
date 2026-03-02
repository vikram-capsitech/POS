import { createContext, useState, useContext } from "react";
import Loader from "./Loader.jsx";

const LoaderContext = createContext({
  setGlobalLoading: () => {},
});

let setGlobalLoadingFn = () => {};


export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  setGlobalLoadingFn = setLoading;

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {loading && <Loader />}
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
export const setGlobalLoading = (value) => {
  setGlobalLoadingFn(value);
};