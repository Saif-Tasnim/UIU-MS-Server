const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

//verify jwt token
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }

    // it will carry bearer token thats why it has to split 
    const token = authorization.split(" ")[1]

    jwt.verify(token, process.env.JSON_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' });
        }

        req.decoded = decoded;
        next();
    })

}

//testing
app.get("/", (req, res) => {
    res.send("UIU MS Server is running 24/7")
})

// database setup info
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.ectfhk2.mongodb.net/?retryWrites=true&w=majority`;

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        // documents create
        const studentCollection = client.db("uiu_ms_database").collection("studentData");
        const facultyCollection = client.db("uiu_ms_database").collection("facultyData");
        const staffCollection = client.db("uiu_ms_database").collection("staffData");

        //    student documents
        app.get("/students", verifyJWT, async (req, res) => {
            const query  = { status: { $ne: 'Alumni' } };
            const result = await studentCollection.find(query).toArray()
            res.send(result);
        })

        app.post('/studentData', verifyJWT, async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const find = await studentCollection.findOne(query);
            if (find) {
                return res.send({ error: true })
            }

            const result = await studentCollection.insertOne(user);
            res.send(result);
        })

        app.post("/facultyData", verifyJWT, async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const find = await facultyCollection.findOne(query);
            if (find) {
                return res.send({ error: true })
            }

            const result = await facultyCollection.insertOne(user);
            res.send(result);
        })

        app.post("/staffData", verifyJWT, async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const find = await staffCollection.findOne(query);
            if (find) {
                return res.send({ error: true })
            }

            const result = await staffCollection.insertOne(user);
            res.send(result);
        })


        // jwt token

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JSON_SECRET_KEY, { expiresIn: "1h" })
            res.send({ token })

        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`uiu server is using current free port : ${port}`)
})