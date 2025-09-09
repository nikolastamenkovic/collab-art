import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";

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

    @ManyToOne(()=>User, (user) => user.pictures, { eager: true })
    author: User;

    @OneToMany(() => Comment, (comment) => comment.picture, { lazy: true })
    comments: Promise<Comment[]>;

    @ManyToMany(() => User, (user) => user.liked_pictures, { lazy: true })
    @JoinTable()
    liked_by: Promise<User[]>;

    @ManyToMany(() => User, (user) => user.disliked_pictures, { lazy: true })
    @JoinTable()
    disliked_by: Promise<User[]>;
    
}
