
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne
} from 'typeorm';
import { UserRole } from './enums/user-role.enum';
import { Student } from '../students/student.entity';
import { Teacher } from '../teacher/teacher.entity';
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({unique:true})
    email : string

    @Column()
    name: string;

    @Column()
    password : string

    @OneToOne(() => Student, (student) => student.user)
    student: Student;

    @OneToOne(() => Teacher , (teacher) => teacher.user )
    teacher : Teacher
    @Column({default:UserRole.OPERATOR}) // Default role is opreator beacuse this not need data like user and teacher ^_^ 
    role : UserRole

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}