import React, { useState } from "react";
import * as XLSX from "xlsx";

const ReadingExcelFile = ({ setDataFromExcel }) => {
  const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setData(jsonData);
      setDataFromExcel(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 text-center">
      <label>
        Upload Excel file:
        <input
          type="file"
          accept=".xlsx, .xls"
          className="border border-blue-500 p-2 rounded ml-2"
          onChange={handleFileUpload}
        />
      </label>

      {data.length > 0 && (
        <pre className="mt-4 bg-gray-100 p-2 rounded text-left">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ReadingExcelFile;
