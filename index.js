import * as dotenv from "dotenv";
dotenv.config();

import fs from 'fs';
import http from 'http';
import path from 'path';

import multer from 'multer';
import sharp from 'sharp';

import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from "mongoose";
import cors from 'cors';
import fetch from 'node-fetch';

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./schema/resolvers.js";

import User from "./models/User.js";

const mongodbURI = process.env.MONGODB_URI;
const port = process.env.PORT;
const origin = process.env.ORIGIN || ['https://next-forum-client.vercel.app'];

const app = express();

await fetch('https://next-forum-client.vercel.app/');

// Fetch the link every ~14.8 minutes (300000 milliseconds)
setInterval(() => {
  fetch('https://next-forum-client.vercel.app/')
    .then(res => res.text())
    .then(body => console.log("fetched successfully"))
    .catch(err => console.error(err));
}, 3 * 290000);

const multerStorage = multer.memoryStorage(
// {
//   destination: (req, file, cb) => {
//     cb(null, "");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// }
);

const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Error: Uploaded file is not an image.", false);
  }
};

const upload = multer(
{
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}
// {
//   dest: "public/img/users",
//   limits: {
//     fileSize: 0.5 * 1024 * 1024,
//   },
// }
);

          // <form method="POST" action={`${BASE_URL}/upload`} encType="multipart/form-data" >
          //   <input type="file" id="avatar" name="avatar" />
          //   <input type="submit" />
          // </form>


          // <form onSubmit={handleUploadAvatar} >
          //   <input type="file" id="avatar" name="avatar" />
          //   <input type="submit" />
          // </form>

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// Cross Origin Resource Sharing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://next-forum-client.vercel.app");
  res.header(
    "Access-Control-Allow-Methods",
    "POST, GET, OPTIONS, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});

app.post("/upload", upload.single('avatar'), async (req, res) => {
  // console.log(req.file);
  // console.log(req.file.path);

  // sharp(req.file.buffer)
  //   .resize(200)
  //   .jpeg({ mozjpeg: true })
  //   .toFile(`./public/img/users/${req.file.originalname}-user${req.body._id}.jpeg`)
  //   .then(data => console.log(data))
  //   .catch(error => {
  //     res.status(400).json({ error: error.message });
  //   });

  try {
    const savedImage = await sharp(req.file.buffer)
      .resize(200)
      .jpeg({ mozjpeg: true })
      .toFile(`./public/img/users/${req.file.originalname}-user${req.body._id}.jpeg`);

    if (savedImage) {
      const updatedUser = await User.findByIdAndUpdate(req.body._id, { picture: `${req.file.originalname}-user${req.body._id}.jpeg` });

      res.status(201).json({ message: "Success!" });
    }
  } catch(error) {
    res.status(400).json({ error: "Image is corrupted, please choose another" });
  }
});

app.use(
  '/',
  cors({ origin, credentials: true, methods: ["GET", "POST"] }),
  cookieParser(),
  expressMiddleware(server,
    {
      context: async function({ req, res }) {
        // console.log(req.headers);
        // console.log(Object.keys(req));
        
        return { req, res }
      },
    }
  ),
);

mongoose.set("strictQuery", false);
mongoose
  .connect(mongodbURI)
  .then(async function() {
    await new Promise((resolve) => httpServer.listen({ port }, resolve))
    console.log(`🚀  Server ready at: http://localhost:4000/`)
  })
  .catch(function(error) {
    console.log(error)
  });
