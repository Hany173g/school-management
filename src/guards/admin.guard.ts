import { CanActivate,ExecutionContext } from "@nestjs/common";
import { UserRole } from "../users/enums/user-role.enum";



export class AdminGaurd implements CanActivate {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()
        let role = request.user?.role
        let allowRoles = [UserRole.ADMIN]
        return allowRoles.includes(role)
    }
}