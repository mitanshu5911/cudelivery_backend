import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
let url = process.env.FRONTEND_URL;
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try{
                const email = profile.emails[0].value;

                let user = await User.findOne({email});

                if(!user){
                    user = await User.create({
                        name: profile.displayName,
                        email,
                        googleId: profile.id,
                        authProvider: "google",
                    });
                }
                done(null,user);
            }catch(err){
                done(err,null);
            }
        }

    )
);
export default passport;