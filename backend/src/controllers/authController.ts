import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    successRedirect: `${process.env.FRONTEND_URL}/dashboard`,
  })(req, res, next);
};

export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    const user = req.user as any;
    res.json({
      success: true,
      data: {
        id: user.id || user._id?.toString(),
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        googleId: user.googleId,
      },
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }
};
