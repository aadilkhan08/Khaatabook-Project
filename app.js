const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Function to create a unique file name if it already exists
function createUniqueFileName(directory, baseFileName, extension) {
    let fileName = baseFileName;
    let filePath = path.join(directory, `${fileName}${extension}`);
    let counter = 1;

    // Check if the file already exists, and if it does, append a number in parentheses to the file name
    while (fs.existsSync(filePath)) {
        fileName = `${baseFileName}(${counter})`;
        filePath = path.join(directory, `${fileName}${extension}`);
        counter++;
    }

    return filePath;
}

app.get('/', (req, res) => {
    fs.readdir('./hisaab', (err, files) => {
        if (err) return res.status(500).send(err);

        // Reading the contents of the hisaab files including their timestamps
        const fileData = files.map(file => {
            const content = fs.readFileSync(`./hisaab/${file}`, 'utf8');
            const stats = fs.statSync(`./hisaab/${file}`);
            const time = stats.mtime.toTimeString().split(' ')[0]; // Extracting time from modification date

            return { name: file, time: time };
        });

        res.render('index', { files: fileData });
    });
});

app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/createhisaab', (req, res) => {
    let currentdate = new Date();
    let baseFileName = `${currentdate.getDate()}-${currentdate.getMonth() + 1}-${currentdate.getFullYear()}`;
    let extension = '.txt';
    let time = `${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;

    // Use the createUniqueFileName function to get a unique file path
    let filePath = createUniqueFileName('./hisaab', baseFileName, extension);

    // Write the file content
    fs.writeFile(filePath, req.body.content, (err) => {
        if (err) return res.status(500).send(err);

        res.redirect('/');
    });
});

app.get('/edit/:filename', (req, res) => {
    fs.readFile(`./hisaab/${req.params.filename}`, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        res.render('edit', { data, filename: req.params.filename });
    });
});

app.post('/update/:filename', (req, res) => {
    fs.writeFile(`./hisaab/${req.params.filename}`, req.body.content, (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

app.get('/hisaab/:filename', (req, res) => {
    fs.readFile(`./hisaab/${req.params.filename}`, 'utf8', (err, data) => {
        if (err) return res.status(500).send(err);
        res.render('hisaab', { data, filename: req.params.filename });
    });
});

app.get('/delete/:filename', (req, res) => {
    fs.unlink(`./hisaab/${req.params.filename}`, (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
