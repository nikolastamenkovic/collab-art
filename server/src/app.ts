import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/authRoutes";
import pictureRoutes from "./routes/pictureRoutes";
import { seedDatabase } from "./seedDatabase";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

AppDataSource.initialize()
    .then(async () => {
        console.log("Baza podataka uspešno povezana!");

        await seedDatabase();

        app.use("/auth", authRoutes);
        app.use("/pictures", pictureRoutes);

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server pokrenut na http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Greška prilikom povezivanja s bazom podataka:", error);
    }
);
