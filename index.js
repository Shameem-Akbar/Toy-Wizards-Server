const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dmqu4oo.mongodb.net/?retryWrites=true&w=majority`;

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
        client.connect();

        const toyCollection = client.db('toyWizards').collection('toys');


        //getting toy data by email
        app.get('/my-toys/:email', async (req, res) => {
            const type = req.query.type === "ascending";
            const value = req.query.value;
            const sortObj = {};
            sortObj[value] = type ? 1 : -1;

            if (sortObj[value]) {
                result = await toyCollection.find({ email: req.params.email }).sort(sortObj).toArray();
            }
            else (
                result = await toyCollection.find({ email: req.params.email }).toArray()
            )
            res.send(result);
        })

        //adding toys to db
        app.post('/add-toy', async (req, res) => {
            const addToys = req.body;
            const result = await toyCollection.insertOne(addToys);
            res.send(result);
        })

        //update toy to db
        app.put('/update-toy/:id', async (req, res) => {
            const updatedToy = req.body;
            console.log(updatedToy);
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    sellerName: updatedToy.sellerName,
                    toyName: updatedToy.toyName,
                    subCategory: updatedToy.subCategory,
                    rating: updatedToy.rating,
                    photoUrl: updatedToy.photoUrl,
                    price: updatedToy.price,
                    quantity: updatedToy.quantity,
                    description: updatedToy.description,
                    email: updatedToy.email,
                }
            }
            const result = await toyCollection.updateOne(filter, updateDoc, options)
            res.send(result);
        })

        //delete toy from db
        app.delete('/delete-toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
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
    res.send('Toy Wizards is Running');
})

app.listen(port, () => {
    console.log(`Toy Wizard Server is running on PORT: ${port}`);
})