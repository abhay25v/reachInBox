import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import { AppDataSource } from './database';
import { ObjectId } from 'mongodb';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userRepository = AppDataSource.getMongoRepository(User);
        
        // Check if user already exists
        let user = await userRepository.findOne({
          where: { googleId: profile.id },
        });

        if (!user) {
          // Create new user
          user = userRepository.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            profilePicture: profile.photos?.[0]?.value,
          });
          await userRepository.save(user);
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const userRepository = AppDataSource.getMongoRepository(User);
    const user = await userRepository.findOne({ 
      where: { _id: new ObjectId(id) } as any 
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
