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
        origin: "http://localhost:5173",
        credentials: true
    }
});

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

AppDataSource.initialize()
    .then(async () => {
        console.log("Baza podataka uspešno povezana!");

        await seedDatabase();

        app.use("/auth", authRoutes);
        app.use("/pictures", pictureRoutes);

        setupSocket(io);
        const port = process.env.PORT || 3000; //ovo je za backend
        httpServer.listen(port, () => {
            console.log(`Server pokrenut na http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Greška prilikom povezivanja s bazom podataka:", error);
    }
);
