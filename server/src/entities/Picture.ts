import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity('pictures')
export class Picture {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column("json")
    picture_data: string[][];

    @ManyToOne(()=>User, (user) => user.pictures, { cascade: true, eager: true })
    author: User;
}
