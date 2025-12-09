import React from 'react'
import * as FileSaver from "file-saver";

import * as XLSX from "xlsx";

export const ExportToExcel = ({ apiData, fileName, btnType }) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const exportToCSV = (apiData, fileName) => {
    console.log(apiData);

    const ws = XLSX.utils.json_to_sheet(apiData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  return (
    <button className="btn btn-primary btn-sm mr-3" onClick={(e) => exportToCSV(apiData, fileName)}><b>{btnType}</b></button>
  );
};