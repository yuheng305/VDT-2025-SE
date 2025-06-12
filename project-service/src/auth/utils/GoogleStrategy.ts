import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, StrategyOptions } from "passport-google-oauth20";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: AuthService // Replace 'any' with your actual AuthService type
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL}/api/auth/google/redirect`,
            scope: ['email', 'profile'],
            prompt: 'login',
        } as StrategyOptions);
    }
    
    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        console.log(accessToken, refreshToken, profile);

        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName;

        if (!email) {
            throw new Error('Google profile does not contain an email.');
        }

        const user = await this.authService.validateUser({
            email,
            displayName,
        });

        console.log('Validate');
        console.log(user);
        return user || null;
    }

}