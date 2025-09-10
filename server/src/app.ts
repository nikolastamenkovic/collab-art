import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/authRoutes";
import pictureRoutes from "./routes/pictureRoutes";
import { seedDatabase } from "./seedDatabase";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        credentials: true
    }
});

app.use(cors({
    origin: '*'
}));

app.use(express.json());

AppDataSource.initialize()
    .then(async () => {
        console.log("Database connected successfully!");

        await seedDatabase();

        app.use("/auth", authRoutes);
        app.use("/pictures", pictureRoutes);

        setupSocket(io);
        const port = process.env.PORT || 3001;
        httpServer.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Error occurred while connecting to database:", error);
    }
);
