import { Inject, Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "../auth.service";
import { Employee } from "generated/prisma";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService:AuthService
    ) {
        super();
    }

    serializeUser(user: Employee, done: Function) {
        console.log('Serializing user:', user);
        done(null, user);
    }

    async deserializeUser(payload: any, done: Function) {
        const user = await this.authService.findUser(payload.id);
        console.log('Deserializing user:', user);
        return user ? done(null, user) : done(null, null);
    }
}