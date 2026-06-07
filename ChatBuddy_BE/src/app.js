import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import fileUpload from "express-fileupload";
import cors from "cors";
import createHttpError from "http-errors";
import routes from "./routes/index.js";

//using express
const app = express();

//using dotenv
dotenv.config();

//using morgan
if(process.env.NODE_ENV!=="production"){
    app.use(morgan("dev"));
}

//using helmet
app.use(helmet());

//using Parse json
app.use(express.json());
app.use(express.urlencoded({extended:true}));//parse json req body

//sanitizing req data
app.use(mongoSanitize());

//enabling cookie parser
app.use(cookieParser());

//enabling gzip compression
app.use(compression());

//file uploading
app.use(fileUpload({
    useTempFiles: true,
}))

//using cors
app.use(cors({
  origin: process.env.CLIENT_ENDPOINT,
  credentials: true,
}));

//router
app.use("/api",routes);

app.post("/test",(req,res)=>{
    throw createHttpError.BadRequest("This route has error");
})

app.use(async(req,res,next)=>{
    next(createHttpError.NotFound("This Route does not exits"));
})

//error handling
app.use(async (err,req,res,next) =>{
    res.status(err.status || 500);
    res.send({
        error:{
            status: err.status || 500,
            message: err.message,
        }
    })
})


export default app;

