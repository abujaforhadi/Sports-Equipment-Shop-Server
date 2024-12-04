const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
require("dotenv").config();
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb"); // Import ObjectId

// Middleware
app.use(cors());
app.use(express.json());

const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${db_username}:${db_password}@cluster0.006kz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("BDSports");
    const collection = db.collection("products");

   
    app.get("/data", async (req, res) => {
      try {
        const data = await collection.find({}).toArray();
        res.json(data);
      } catch (error) {
        console.error("Error fetching data from database:", error);
        res.status(500).send("Error fetching data from database");
      }
    });

    app.post("/data", async (req, res) => {
      try {
        const data = await collection.insertOne(req.body);
        res.json(data);
      } catch (error) {
        console.error("Error inserting data into database:", error);
        res.status(500).send("Error inserting data into database");
      }
    });

    app.get("/data/:id", async (req, res) => {
      const { id } = req.params; 
      console.log(`Fetching product with id: ${id}`);
      try {
        const product = await collection.findOne({ _id: new ObjectId(id) }); 
        if (product) {
          res.json(product); 
        } else {
          console.log("Product not found");
          res.status(404).json({ error: "Product not found" }); 
        }
      } catch (error) {
        console.error("Error fetching product:", error); 
        res.status(500).json({ error: "Error fetching product" }); 
      }
    });
    
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  await connectToDatabase();
  console.log(`Server running at http://localhost:${port}`);
});
