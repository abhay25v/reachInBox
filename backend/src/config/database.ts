import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Email } from '../models/Email';
import { User } from '../models/User';

dotenv.config();

const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/email_scheduler';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: mongoUrl,
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [Email, User],
});
