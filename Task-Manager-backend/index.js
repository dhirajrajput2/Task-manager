import express from "express";
import connectToMongo from "./database.js";
import cors from "cors";
import taskRoutes from './routes/task.js';
import authRoutes from './routes/auth.js';




const app=express();
const port=5000;

app.use(express.json());
app.use(cors());
app.use('/api/tasks/', taskRoutes);
app.use('/api/auth', authRoutes);

connectToMongo()
app.listen(port,()=>{
    console.log(`Server in running on ${port} port.`)
})
