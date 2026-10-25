import { Column,PrimaryGeneratedColumn,Entity , ManyToOne  , OneToMany} from "typeorm";
import { Teacher } from "../teacher/teacher.entity";
import { Student } from "../students/student.entity";



@Entity() 

export class Classes {
    @PrimaryGeneratedColumn()
    id : number;

    @ManyToOne(() => Teacher , (teacher) => teacher.classes, {
        onDelete:'RESTRICT' // beacuse we don't want delete teacher if have any classes
    })
    teacher : Teacher
    @Column()
    name : string
    @Column()
    capacity : number
    @OneToMany(() => Student, (student) => student.classes)
    students: Student[];
}