import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CropContextType = {
  selectedCrop: string;
  setSelectedCrop: (crop: string) => void;
};

const CropContext = createContext<CropContextType>({
  selectedCrop: "",
  setSelectedCrop: () => {},
});

export const useCropContext = () => useContext(CropContext);

export function CropProvider({ children }: { children: React.ReactNode }) {
  const [selectedCrop, setSelectedCropState] = useState<string>("");

  useEffect(() => {
    AsyncStorage.getItem("farmrisk_selected_crop").then((val) => {
      if (val) setSelectedCropState(val);
    });
  }, []);

  const setSelectedCrop = (crop: string) => {
    setSelectedCropState(crop);
    AsyncStorage.setItem("farmrisk_selected_crop", crop);
  };

  return (
    <CropContext.Provider value={{ selectedCrop, setSelectedCrop }}>
      {children}
    </CropContext.Provider>
  );
}
