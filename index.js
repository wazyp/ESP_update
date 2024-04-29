const express = require('express');
const path = require('path');
const multer = require('multer');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const { networkInterfaces } = require('os');
 
const app = express();
const nets = networkInterfaces();
 
// Server port
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // Other Firebase configuration options if needed
});

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRecord = await admin.auth().createUser({
            email,
            password
        });
        res.status(200).json({ message: 'User registered successfully', uid: userRecord.uid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRecord = await admin.auth().getUserByEmail(email);
        // Perform authentication
        // Example: You can compare userRecord.passwordHash with hashed password stored in your database
        res.status(200).json({ message: 'Login successful', uid: userRecord.uid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
 
 const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'firmware'));
    },
    filename: function (req, file, cb) {
        cb(null, 'httpUpdateNew.bin');
    }
});
const upload = multer({ storage: storage });
 app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// app.get('/', (request, response) => response.send('Hello from www.mischianti.org!'));
 
 app.post('/upload', upload.single('firmware'), (req, res) => {
    res.send('File uploaded successfully!');
});

let downloadCounter = 1;
app.get('/firmware/httpUpdateNew.bin', (request, response) => {
    response.download(path.join(__dirname, 'firmware/httpUpdateNew.bin'), 'httpUpdateNew.bin', (err)=>{
        if (err) {
            console.error("Problem on download firmware: ", err)
        }else{
            downloadCounter++;
        }
    });
    console.log('Your file has been downloaded '+downloadCounter+' times!')
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});
 
// Define a function to generate a random weight between 0 and 2000 grams
const getRandomWeight = () => Math.floor(Math.random() * (2001 - 100) + 100);

// Define a function to generate a random temperature between 10 and 40 degrees Celsius
const getRandomTemperature = () => Math.floor(Math.random() * (41 - 10) + 10);

// Endpoint to get random weight and temperature
app.get('/getData', (req, res) => {
    const weight = getRandomWeight();
    const temperature = getRandomTemperature();

    res.json({
        weight: weight,
        temperature: temperature
    });
});

app.listen(PORT, () => {
    const results = {}; // Or just '{}', an empty object
 
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
 
    console.log('Listening on port '+PORT+'\n', results)
});