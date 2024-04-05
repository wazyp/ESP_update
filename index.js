const express = require('express');
const path = require('path');
const multer = require('multer');
const { networkInterfaces } = require('os');
 
const app = express();
const nets = networkInterfaces();
 
// Server port
const PORT = 3000;

 
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
})
 
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