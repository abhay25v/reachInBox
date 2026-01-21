import nodemailer from 'nodemailer';
import logger from '../config/logger';
import dotenv from 'dotenv';

dotenv.config();

interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

interface EmailResponse {
  success: boolean;
  messageId: string;
  previewUrl?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('SMTP connection error:', error);
      } else {
        logger.info('✅ SMTP server is ready to send emails');
      }
    });
  }

  /**
   * Send an email
   */
  async send(options: SendEmailOptions): Promise<EmailResponse> {
    const { to, subject, body, from } = options;

    try {
      const info = await this.transporter.sendMail({
        from: from || process.env.SMTP_FROM || '"Email Scheduler" <noreply@emailscheduler.com>',
        to,
        subject,
        text: body,
        html: this.formatHtml(body),
      });

      logger.info(`Email sent to ${to}`, {
        messageId: info.messageId,
      });

      // Get preview URL for Ethereal
      const previewUrl = nodemailer.getTestMessageUrl(info);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } catch (error: any) {
      logger.error(`Failed to send email to ${to}`, {
        error: error.message,
      });
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  /**
   * Format plain text to basic HTML
   */
  private formatHtml(text: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
            ${text.split('\n').map(line => `<p style="margin: 10px 0;">${line}</p>`).join('')}
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p>Sent by Email Scheduler</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Create test account credentials for Ethereal (useful for development)
   */
  static async createTestAccount(): Promise<{
    user: string;
    pass: string;
    smtp: { host: string; port: number; secure: boolean };
    web: string;
  }> {
    const testAccount = await nodemailer.createTestAccount();
    return {
      user: testAccount.user,
      pass: testAccount.pass,
      smtp: testAccount.smtp,
      web: testAccount.web,
    };
  }
}

export const emailService = new EmailService();

// Export convenience function
export const sendEmail = (options: SendEmailOptions) => emailService.send(options);

export default emailService;
