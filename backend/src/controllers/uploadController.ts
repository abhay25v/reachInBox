import { Request, Response } from 'express';
import csv from 'csv-parser';
import { Readable } from 'stream';
import logger from '../config/logger';

interface ParsedEmailRow {
  email?: string;
  Email?: string;
  EMAIL?: string;
  [key: string]: any;
}

export const uploadCsv = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const emails: string[] = [];
    const fileBuffer = req.file.buffer;
    const stream = Readable.from(fileBuffer.toString());

    stream
      .pipe(csv())
      .on('data', (row: ParsedEmailRow) => {
        // Look for email in common column names
        const email = row.email || row.Email || row.EMAIL || row['Email Address'];
        if (email && typeof email === 'string' && email.includes('@')) {
          emails.push(email.trim());
        }
      })
      .on('end', () => {
        logger.info(`Parsed ${emails.length} emails from CSV`);
        res.json({
          success: true,
          data: {
            emails,
            count: emails.length,
          },
        });
      })
      .on('error', (error) => {
        logger.error('CSV parsing error:', error);
        res.status(400).json({
          success: false,
          error: 'Failed to parse CSV file',
        });
      });
  } catch (error: any) {
    logger.error('Error uploading CSV:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
