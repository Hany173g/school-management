import { User } from "../users/user.entity";
import { Request } from "@nestjs/common";


declare global {
    namespace Express {
        interface Request {
            user?:User | null
        }
    }
}


export { }