import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { User } from "./User";
import { Picture } from "./Picture";

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    text: string;

    @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE", eager: true })
    author: User;

    @ManyToOne(() => Picture, (picture) => picture.comments, { onDelete: "CASCADE", eager: true })
    picture: Picture;

    @CreateDateColumn()
    created_at: Date;
}
