import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Picture } from './Picture'


@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @OneToMany(()=>Picture, (picture) => picture.author, { cascade: false, lazy: true })
    pictures: Promise<Picture[]>;
}
