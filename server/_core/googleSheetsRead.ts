import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const SHEET_ID = '1xa7YDW1kjvVr-oLwWZETjwhNAxJVFuXF1uXWLZoSXnk';
const KEY_FILE_PATH = path.join(process.cwd(), 'gen-lang-client-0038868491-8cd68d6bc4aa.json');

export async function getSheetData(range: string) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });
    return response.data.values;
  } catch (error) {
    console.error('[GoogleSheets] Read error:', error);
    return null;
  }
}
