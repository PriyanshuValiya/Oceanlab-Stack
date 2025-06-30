import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

export class GoogleSheetsService {
  private sheets: any
  private spreadsheetId: string

  constructor() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: SCOPES,
      })

      this.sheets = google.sheets({ version: "v4", auth })
      this.spreadsheetId = process.env.GOOGLE_SHEET_ID || ""

      if (!this.spreadsheetId) {
        console.warn("GOOGLE_SHEET_ID not found in environment variables")
      }
    } catch (error) {
      console.error("Failed to initialize Google Sheets service:", error)
      throw error
    }
  }

  async readSheet(range: string) {
    try {
      if (!this.spreadsheetId) {
        console.warn("No spreadsheet ID configured, returning empty array")
        return []
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      })
      return response.data.values || []
    } catch (error) {
      console.error(`Error reading sheet range ${range}:`, error)
      return [] // Return empty array instead of throwing
    }
  }

  async writeSheet(range: string, values: any[][]) {
    try {
      if (!this.spreadsheetId) {
        throw new Error("No spreadsheet ID configured")
      }

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values,
        },
      })
    } catch (error) {
      console.error(`Error writing to sheet range ${range}:`, error)
      throw new Error("Failed to write to Google Sheets")
    }
  }

  async appendSheet(range: string, values: any[][]) {
    try {
      if (!this.spreadsheetId) {
        throw new Error("No spreadsheet ID configured")
      }

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values,
        },
      })
    } catch (error) {
      console.error(`Error appending to sheet range ${range}:`, error)
      throw new Error("Failed to append to Google Sheets")
    }
  }

  async clearSheet(range: string) {
    try {
      if (!this.spreadsheetId) {
        throw new Error("No spreadsheet ID configured")
      }

      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range,
      })
    } catch (error) {
      console.error(`Error clearing sheet range ${range}:`, error)
      throw new Error("Failed to clear Google Sheets")
    }
  }
}
