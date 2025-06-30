/**
 * Google Sheets Setup Script
 *
 * This script helps set up the initial Google Sheets structure
 * Run this after creating your Google Sheet and service account
 */

const { GoogleSpreadsheet } = require("google-spreadsheet")

async function setupGoogleSheets() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID)
  const auth = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }

  try {
    await doc.useServiceAccountAuth(auth)
    await doc.loadInfo()
    console.log("Connected to Google Sheet:", doc.title)

    // Create sheets if they don't exist
    const sheetNames = ["Clients", "Income_Transactions", "Expenses", "Projects", "Users"]

    for (const sheetName of sheetNames) {
      let sheet = doc.sheetsByTitle[sheetName]

      if (!sheet) {
        sheet = await doc.addSheet({ title: sheetName })
        console.log(`Created sheet: ${sheetName}`)
      }

      // Set up headers based on sheet type
      switch (sheetName) {
        case "Clients":
          await sheet.setHeaderRow(["ID", "Nickname", "Address", "City", "CreatedAt"])
          break
        case "Income_Transactions":
          await sheet.setHeaderRow(["ID", "ClientID", "Amount", "Date", "Description", "ProjectID"])
          break
        case "Expenses":
          await sheet.setHeaderRow(["ID", "Category", "Amount", "ProjectID", "Date", "Description"])
          break
        case "Projects":
          await sheet.setHeaderRow(["ID", "Name", "ClientID", "StartDate", "EndDate", "Status"])
          break
        case "Users":
          await sheet.setHeaderRow(["ID", "Username", "Password", "Role", "CreatedAt"])
          break
      }

      console.log(`Set up headers for: ${sheetName}`)
    }

    console.log("Google Sheets setup completed successfully!")
  } catch (error) {
    console.error("Error setting up Google Sheets:", error)
  }
}

// Run the setup
if (require.main === module) {
  setupGoogleSheets()
}

module.exports = { setupGoogleSheets }
