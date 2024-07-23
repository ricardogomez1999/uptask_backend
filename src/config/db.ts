import mongoose from "mongoose";
import colors from "colors";
import { exit } from "node:process";

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DATABASE_URL);
    const url = `${connection.host}:${connection.port}`;

    console.log(colors.magenta.bold(`MongoDB connected in ${url}`));
  } catch (error) {
    console.log(colors.red.bold("Connection error with MongoDB"));
    exit(1); // el numero 1 se le pone por que asi le dices al programa que la conexión fallo pero que se detenga, si le pones 0 es que no falló
  }
};
