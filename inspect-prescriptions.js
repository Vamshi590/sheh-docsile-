const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Get the AppData path for accessing user data
const appDataPath = path.join(process.env.APPDATA, 'ShehData');
const prescriptionsFilePath = path.join(appDataPath, 'prescriptions_and_receipts.xlsx');

if (!fs.existsSync(prescriptionsFilePath)) {
  console.log(`File does not exist: ${prescriptionsFilePath}`);
  process.exit(1);
}

try {
  const workbook = XLSX.readFile(prescriptionsFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Get the raw data as an array of arrays
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Print the header row to see all column names
  console.log("Header row (column names):");
  console.log(JSON.stringify(rawData[0], null, 2));
  
  // Convert to JSON with proper headers
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  // Print the first row of data
  if (jsonData.length > 0) {
    console.log("\nFirst row data:");
    console.log(JSON.stringify(jsonData[0], null, 2));
    
    // Print all keys in the first row
    console.log("\nAll keys in first row:");
    console.log(Object.keys(jsonData[0]));
  }
  
  console.log(`\nTotal rows: ${jsonData.length}`);
} catch (error) {
  console.error(`Error reading file ${prescriptionsFilePath}:`, error);
}
