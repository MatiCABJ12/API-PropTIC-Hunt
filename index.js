import "dotenv/config";
import express from "express";
import cors from "cors";
import AuthRouter from "./routes/auth.router.js";
import UsuariosRouter from "./routes/usuarios.router.js";
import EstadisticasRouter from "./routes/estadisticas.router.js";
import JuegoRouter from "./routes/juego.router.js";
import LogsRouter from "./routes/logs.router.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (_, res) => res.send("PropTIC-Hunt API is running..."));
app.use("/auth", AuthRouter);
app.use("/usuarios", UsuariosRouter);
app.use("/estadisticas", EstadisticasRouter);
app.use("/juego", JuegoRouter);
app.use("/logs", LogsRouter);

app.use((error, req, res, next) => {
  if (error.code === "23505") {
    return res
      .status(409)
      .json({ message: "Ese mail o nombre de usuario ya está registrado" });
  }
  console.error(error);
  res.status(500).json({ message: error.message });
});

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

export default app;