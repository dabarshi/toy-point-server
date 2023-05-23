const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());

// const corsConfig = {
//     origin: '',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE']
// }
// app.use(cors(corsConfig))
// app.options("", cors(corsConfig))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });




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
 

        // create database
        const toyDBCollection = client.db('toyDB').collection('toyCollection');

        // simple get operation with limit and search query
        app.get('/toys', async (req, res) => {
            let query = {};


            // set query for search by toy Name
            if (req.query?.toyName) {
                query = { toyName: req.query.toyName }
            }

            // set query for searching subCategory
            if (req.query?.subCategory) {
                query = { subCategory: req.query.subCategory }
            }

           
            const cursor = toyDBCollection.find(query).limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })

        // get toys with query Email 
        app.get('/selective-toys', async (req, res) => {

            let query = {};
            let sorting = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }

            // set query for sorting value
            if (req.query?.sorting) {
                sorting = { price: parseInt(req.query.sorting) }
            }


            const result = await toyDBCollection.find(query).sort(sorting).toArray();
            res.send(result)
        })

        // get the new data with limit 3 
        app.get('/new-toys', async(req, res) => {
            const result = await toyDBCollection.find().sort({_id: -1}).limit(3).toArray();
            res.send(result);
        })

        // get with id

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyDBCollection.findOne(query);
            res.send(result);
        })

        // post operation for add a toy info
        app.post('/toys', async (req, res) => {
            const toyInfo = req.body;
            console.log('toyInfo: ', toyInfo)
            const result = await toyDBCollection.insertOne(toyInfo);
            res.send(result);
        })

        // put operation on single document
        app.put('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const updatedToyInfo = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };

            const newToyInfo = {
                $set: {
                    toyName: updatedToyInfo.toyName,
                    toyPhoto: updatedToyInfo.toyPhoto,
                    sellerName: updatedToyInfo.sellerName,
                    email: updatedToyInfo.email,
                    subCategory: updatedToyInfo.subCategory,
                    price: updatedToyInfo.price,
                    rating: updatedToyInfo.rating,
                    quantity: updatedToyInfo.quantity,
                    details: updatedToyInfo.details
                }
            }

            const result = await toyDBCollection.updateOne(filter, newToyInfo, options);
            res.send(result);

        })

        // delete operation with id params 
        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyDBCollection.deleteOne(query);
            res.send(result);

        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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