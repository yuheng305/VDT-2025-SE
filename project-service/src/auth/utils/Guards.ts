// utils/Guards.ts
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activate = (await super.canActivate(context)) as boolean;

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Chỉ khi chưa có session mới redirect tới Google
    if (!request.isAuthenticated?.() || !request.user) {
      this.handleRequest(null, null, request, response);
    }

    return activate;
  }

  getAuthenticateOptions() {
    return {
      prompt: 'select_account', // buộc Google hiện lại tài khoản
    };
  }
}
