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
      <label className="flex flex-col items-center w-full cursor-pointer">
        <span className="mb-2 text-sm font-medium text-gray-700">
          Upload Excel File
        </span>
        <div className="relative flex items-center justify-center w-full max-w-sm p-4 border-2 border-dashed border-blue-400 rounded-2xl bg-blue-50 hover:bg-blue-100 transition">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <span className="flex items-center space-x-2 text-blue-600 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Choose Excel File</span>
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-500">Supports .xls and .xlsx</p>
      </label>

      {/* {data.length > 0 && (
        <pre className="mt-4 bg-gray-100 p-2 rounded text-left">
          {JSON.stringify(data, null, 2)}
        </pre>
      )} */}
    </div>
  );
};

export default ReadingExcelFile;
