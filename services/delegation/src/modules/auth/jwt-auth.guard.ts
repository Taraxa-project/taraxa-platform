import { Reflector } from "@nestjs/core";
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "./jwt.constant";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err) {
      throw err;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!user && !isPublic) {
      throw new UnauthorizedException(info?.message);
    }

    return user;
  }
}
