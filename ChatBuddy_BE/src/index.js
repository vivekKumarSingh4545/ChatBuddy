import mongoose from "mongoose";
import app from "./app.js";
import logger from "./configs/logger.config.js";
import { Server } from "socket.io";
import SocketServer from "./SocketServer.js";

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

//error in mongodb connecting
mongoose.connection.on("error",(err)=>{
    logger.error(`Connection error : ${err}`);
    process.exit(1);
});

if(process.env.NODE_ENV !== "production"){
    mongoose.set("debug",true);
}

//mongodb connecting
mongoose.connect(DATABASE_URL).then(()=>{
    logger.info(`Server connected to Database`);
});
//{ useNewUrlParser:true, useUnifiedTopology:true}

let server = app.listen(PORT,()=>{
    logger.info(`server running on port ${PORT}`);
});

//socket io
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.CLIENT_ENDPOINT,
    },
  });
  io.on("connection", (socket) => {
    logger.info("socket io connected successfully.");
    SocketServer(socket, io);
  });

//error handling
const exitHandler = ()=>{
    if(server){
        logger.info("server closing");
        process.exit(1);
    }
    else{
        process.exit(1);
    }
}

const errorCaught = (error)=>{
   logger.error(error);
   exitHandler();
}

process.on("uncaughtException",errorCaught);
process.on("unhandledRejection",errorCaught);