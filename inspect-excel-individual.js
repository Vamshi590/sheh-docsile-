const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Get the AppData path for accessing user data
const appDataPath = path.join(process.env.APPDATA, 'ShehData');

// Define file paths
const filePaths = {
  patients: path.join(appDataPath, 'patients.xlsx'),
  prescriptions: path.join(appDataPath, 'prescriptions_and_receipts.xlsx'),
  medicines: path.join(appDataPath, 'medicines.xlsx'),
  opticals: path.join(appDataPath, 'opticals.xlsx'),
  operations: path.join(appDataPath, 'operations.xlsx')
};

// Function to read and display Excel file structure
function inspectExcelFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${filePath}`);
    return null;
  }
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return data.length > 0 ? data : [];
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Get the file to inspect from command line argument
const fileToInspect = process.argv[2];

if (!fileToInspect || !filePaths[fileToInspect]) {
  console.log('Please specify a valid file to inspect: patients, prescriptions, medicines, opticals, operations');
  process.exit(1);
}

const data = inspectExcelFile(filePaths[fileToInspect]);

if (data && data.length > 0) {
  console.log(`\n=== ${fileToInspect.toUpperCase()} FILE STRUCTURE ===`);
  
  // Display the field names
  console.log('\nField names:');
  console.log(Object.keys(data[0]));
  
  // Display the first row as a sample
  console.log('\nSample data (first row):');
  console.log(JSON.stringify(data[0], null, 2));
  
  // Count total rows
  console.log(`\nTotal rows: ${data.length}`);
} else {
  console.log(`No data found in the ${fileToInspect} file or file could not be read.`);
}
