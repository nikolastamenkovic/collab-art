import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Picture } from "./entities/Picture";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "database",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "admin", 
    database: process.env.DB_NAME || "testdb",
    synchronize: true,
    logging: true,
    entities: [User, Picture]
});