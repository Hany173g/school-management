import { Column,PrimaryGeneratedColumn,Entity , OneToOne  , JoinColumn, ManyToOne} from "typeorm";
import { User } from "../users/user.entity";
import { Classes } from "../class/class.entity";




@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    id : number

    @OneToOne(() => User, (user) => user.student , {
        onDelete:'CASCADE'
    }) 
    @JoinColumn()
    user : User
    @ManyToOne(() => Classes, (classEntity) => classEntity.students, {
        onDelete: 'RESTRICT',
    })
    classes: Classes;
    
}