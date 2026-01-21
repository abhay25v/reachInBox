import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const scheduleEmailSchema = Joi.object({
  subject: Joi.string().min(1).max(255).required(),
  body: Joi.string().min(1).required(),
  recipients: Joi.array().items(Joi.string().email()).min(1).required(),
  startTime: Joi.date().iso().min('now').required(),
  delayBetweenEmails: Joi.number().integer().min(1000).required(),
  hourlyLimit: Joi.number().integer().min(1).optional(),
});

export const validateScheduleEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = scheduleEmailSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

const getEmailsSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'SCHEDULED', 'SENT', 'FAILED', 'RESCHEDULED').optional(),
  batchId: Joi.string().uuid().optional(),
  limit: Joi.number().integer().min(1).max(1000).optional(),
  offset: Joi.number().integer().min(0).optional(),
});

export const validateGetEmails = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = getEmailsSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};
