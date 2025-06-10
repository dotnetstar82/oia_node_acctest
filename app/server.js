import express from "express";
import path from 'path';
import cors from "cors";

import fs from 'fs'
import http from 'http'
import https from 'https'

import dotenv from 'dotenv'
dotenv.config()

import routeTrack from './routes/tracker.route.js'

export const start = async () => {

  const app = express();

  // app.use(cors(corsOptions));
  
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
  });
  
  app.use(express.json()); 
  app.use(express.urlencoded({ extended: true }));
  
  app.use('/api', routeTrack());
  
  const port = process.env.PORT;
  
  // var options = {
  //     key: fs.readFileSync(__dirname + '/../ssl/private.key', 'utf8'),
  //     cert: fs.readFileSync(__dirname + '/../ssl/certificate.crt', 'utf8'),
  // };
  
  console.log(`EAGLEeye API Server up and running on port ${port} !`);
  
  //https.createServer(options, app).listen(port);
  app.listen(port);
}



start()