import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { Picture } from './Picture'
import { Comment } from "./Comment";


@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @OneToMany(()=>Picture, (picture) => picture.author, { lazy: true })
    pictures: Promise<Picture[]>;

    @OneToMany(() => Comment, (comment) => comment.author, { lazy: true })
    comments: Promise<Comment[]>;

    @ManyToMany(() => Picture, (picture) => picture.liked_by, { lazy: true })
    liked_pictures: Promise<Picture[]>;

    @ManyToMany(() => Picture, (picture) => picture.disliked_by, { lazy: true })
    disliked_pictures: Promise<Picture[]>;
}
