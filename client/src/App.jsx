import React, { useState } from "react";
import ReadingExcelFile from "./components/ReadingExcelFile";
import LetterOfAppointment from "./components/LetterOfAppointment";

const App = () => {
  const [dataFromExcel, setDataFromExcel] = useState([]);

  return (
    <div className="flex flex-col justify-center items-center ">
      <ReadingExcelFile setDataFromExcel={setDataFromExcel} />
      <LetterOfAppointment dataFromExcel={dataFromExcel} />
    </div>
  );
};

export default App;
