// Importing necessary modules and interfaces
import { AxiosResponse } from "axios";
import { APISuccessResponseInterface } from "../Interfaces/api";

// A utility function for handling API requests with loading, success, and error handling
export const requestHandler = async (
  api: () => Promise<AxiosResponse<APISuccessResponseInterface, any>>,
  setLoading: ((loading: boolean) => void) | null,
  onSuccess: (data: APISuccessResponseInterface) => void,
  onError: (error: string) => void
) => {
  setLoading && setLoading(true);
  try {
    // Make the API request
    const response = await api();
    const data = response && "data" in response ? response.data : response;
    if (data?.success || (data && !("success" in data))) {
      onSuccess(data);
    }
  } catch (error: any) {
    if ([401, 403].includes(error?.response.data?.statusCode)) {
      localStorage.clear(); // Clear local storage on authentication issues
      if (isBrowser) window.location.href = "/auth/login"; // Redirect to login page
    }
    onError(error?.response?.data?.message || "Something went wrong");
  } finally {
    setLoading && setLoading(false);
  }
};

// A utility function to concatenate CSS class names with proper spacing
export const classNames = (...className: string[]) => {
  return className.filter(Boolean).join(" ");
};

export const isBrowser = typeof window !== "undefined";

// A class that provides utility functions for working with local storage
export class LocalStorage {
  // Get a value from local storage by key
  static get(key: string) {
    if (!isBrowser) return;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  // Set a value in local storage by key
  static set(key: string, value: any) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Remove a value from local storage by key
  static remove(key: string) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }

  // Clear all items from local storage
  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}

export const iconPDF =
  "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/27_Pdf_File_Type_Adobe_logo_logos-512.png";
