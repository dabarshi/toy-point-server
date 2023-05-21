const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());




// mongodb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.75j00aw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create database
    const toyDBCollection = client.db('toyDB').collection('toyCollection');

    // simple get operation
    app.get('/toys', async(req, res) => {
        const cursor = toyDBCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // post operation for add a toy info
    app.post('/toys', async(req, res) => {
        const toyInfo = req.body;
        console.log('toyInfo: ', toyInfo)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy Point is running')
})

app.listen(port, () => {
    console.log(`server is running on port : ${port}`)
})