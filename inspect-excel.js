const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Get the AppData path for accessing user data
const appDataPath = path.join(process.env.APPDATA, 'ShehData');

// Define file paths
const patientsFilePath = path.join(appDataPath, 'patients.xlsx');
const prescriptionsFilePath = path.join(appDataPath, 'prescriptions_and_receipts.xlsx');
const medicinesFilePath = path.join(appDataPath, 'medicines.xlsx');
const opticalsFilePath = path.join(appDataPath, 'opticals.xlsx');
const operationsFilePath = path.join(appDataPath, 'operations.xlsx');

// Function to read and display Excel file structure
function inspectExcelFile(filePath, label) {
  console.log(`\n=== ${label} ===`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${filePath}`);
    return;
  }
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      console.log('No data found in the file');
      return;
    }
    
    // Display the first row's field names
    console.log('Field names:');
    console.log(Object.keys(data[0]));
    
    // Display the first row as a sample
    console.log('\nSample data (first row):');
    console.log(JSON.stringify(data[0], null, 2));
    
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
}

// Inspect all Excel files
inspectExcelFile(patientsFilePath, 'Patients');
inspectExcelFile(prescriptionsFilePath, 'Prescriptions and Receipts');
inspectExcelFile(medicinesFilePath, 'Medicines');
inspectExcelFile(opticalsFilePath, 'Opticals');
inspectExcelFile(operationsFilePath, 'Operations');
