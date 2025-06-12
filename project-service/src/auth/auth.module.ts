import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from './auth.service';
import { Session } from 'inspector/promises';
import { SessionSerializer } from './utils/Serializer';

@Module({
    imports: [PrismaModule],
    controllers: [AuthController],
    providers: [GoogleStrategy, 
        SessionSerializer,{
        provide: 'AUTH_SERVICE',
        useClass: AuthService,
    }],
})
export class AuthModule {}
