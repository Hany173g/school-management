import { Entity , OneToOne , JoinColumn  , PrimaryGeneratedColumn , OneToMany} from "typeorm";
import { User } from "../users/user.entity";
import { Classes } from "../class/class.entity";





@Entity()
export class Teacher {
    @PrimaryGeneratedColumn()
    id : number;

    @OneToOne(() => User , (user) => user.teacher , {
        onDelete:'CASCADE'
    })
    @JoinColumn()
    user : User
    @OneToMany(() => Classes , (classes) => classes.teacher)
    classes : Classes[]
}