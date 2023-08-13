const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const courseCollection = client.db("uiu_ms_database").collection("courses");

        const dummyCollection = client.db("uiu_ms_database").collection("dummyClass");

        const counsellingData = client.db("uiu_ms_database").collection("counsellingData");


        // student documents
        app.get("/students", verifyJWT, async (req, res) => {
            // const query = { role: { $ne: 'Alumni' } };
            const query = { role: "student" };
            const result = await studentCollection.find(query).toArray()
            res.send(result);
        })

        app.get("/students/:email", verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await studentCollection.findOne(query)
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

        app.patch('/updateAlumni/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: {
                    role: "Alumni"
                },
            };

            const result = await studentCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.put('/updateInfo/:id', verifyJWT, async (req, res) => {
            const { firstName, lastName, email, phone, gender, department } = req.body;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                    gender: gender,
                    department: department
                },
            };

            const result = await studentCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.delete('/deleteStudent/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await studentCollection.deleteOne(query);
            res.send(result);
        })

        // faculty documents
        app.get('/faculty', verifyJWT, async (req, res) => {
            const result = await facultyCollection.find().toArray()
            res.send(result);
        })

        app.get('/faculty/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await facultyCollection.findOne(query);
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

        // deleteFaculty
        app.delete('/deleteFaculty/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await facultyCollection.deleteOne(query);
            res.send(result);
        })

        // staff documents

        app.get('/staff', verifyJWT, async (req, res) => {
            const result = await staffCollection.find().toArray()
            res.send(result);
        })

        app.get('/staff/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await staffCollection.findOne(query)
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

        app.post('/assignCourse', verifyJWT, async (req, res) => {
            const data = req.body;
            const query = { courseCode: data.courseCode, section: data.section }
            const find = await courseCollection.findOne(query);
            if (find) {
                return res.send({ message: "already exists" })
            }

            const result = await courseCollection.insertOne(data);
            res.send(result);
        })


        // dummy site link

        app.get('/myclass', async (req, res) => {
            const result = await dummyCollection.findOne();
            res.send(result);
        })

        app.get("/counseling", verifyJWT, async (req, res) => {
            const result = await counsellingData.findOne();
            res.send(result);
        })

        app.post('/counseling', verifyJWT, async (req, res) => {
            const data = req.body;
            const result = await counsellingData.insertOne(data);
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