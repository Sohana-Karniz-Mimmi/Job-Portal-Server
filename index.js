const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// Middleware

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      // 'https://solosphere.web.app',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// My Middleware
const logger = async (req, res, next) => {
  // console.log('called', req.host, req.originalUrl);
  next();
};

const verifyToken = async (req, res, next) => {
  // Get token
  const token = req.cookies.token;
  // console.log("find the valid token", token);
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //if token is not valid... error
    if(err) {
      return res.status(401).send({ message: 'Token is Invalid' });
    }

    // If token is valid
    console.log('value in token', decoded);
    req.user = decoded
    next();
  });


  // next()

};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2xcjib6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobPortalCollection = client.db("jobPortal").collection("jobs");
    const bookingCollection = client.db("CarDoctor").collection("bookings");

    //Tokens
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          // sameSite: 'none',
        })
        .send({ success: true });
    });

    app.post('/logout', async(req, res) => {
      const user = req.body
      console.log('User logged out');
      res.clearCookie('token', {maxAge: 0}).send({message : true})
    })

    // Jobs Spot
    app.get(`/services`, logger, async (req, res) => {
      const cursor = jobPortalCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // app.get(`/services/:id`, async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const options = {
    //     // Include only the `title` and `imdb` fields in the returned document
    //     projection: { title: 1, img: 1, price: 1 },
    //   };
    //   const result = await jobPortalCollection.findOne(query, options);
    //   res.send(result);
    // });

    // app.post(`/bookings`, async (req, res) => {
    //   const bookings = req.body;
    //   // console.log(bookings);
    //   const cookies = req.cookies.token;
    //   console.log(cookies);
    //   const result = await bookingCollection.insertOne(bookings);
    //   res.send(result);
    // });

    // app.get(`/bookings`, logger, verifyToken, async (req, res) => {

    //   // const cookies = req.cookies.token;
    //   // console.log(cookies);

    //   console.log('Main Email',req.query?.email);
    //   console.log('Decoded token', req.user);

    //   if(req.query?.email !== req.user?.email) {
    //     return res.status(403).send({message: 'forbidden access'})
    //   }

    //   let query = {};
    //   if (req.query?.email) {
    //     query = { email: req.query?.email };
    //   }
    //   const cursor = bookingCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // app.patch(`/bookings/:id`, async (req, res) => {
    //   const id = req.params.id;
    //   const books = req.body;
    //   console.log(books);
    //   const filter = { _id: new ObjectId(id) };
    //   const updateBooking = {
    //     $set: {
    //       status: books.status,
    //     },
    //   };
    //   const result = await bookingCollection.updateOne(filter, updateBooking);
    //   res.send(result);
    // });

    // app.delete(`/bookings/:id`, async (req, res) => {
    //   const id = req.params.id;
    //   console.log(id);
    //   const query = { _id: new ObjectId(id) };
    //   const result = await bookingCollection.deleteOne(query);
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Assignment 11 Server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
