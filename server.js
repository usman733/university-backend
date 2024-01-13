// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://127.0.0.1:27017/universities', { useNewUrlParser: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());

const universitySchema = new mongoose.Schema({
    name: String,
    country: String,
    website: String,
    domain: String,
    countryCode: String,
    state: String
});

const University = mongoose.model('University', universitySchema);

app.post('/api/universities', async (req, res) => {
    try {
        const { name, country } = req.body;
        const university = new University({ name, country });
        await university.save();
        res.status(201).json({ message: 'University data saved successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/universities/:country', async (req, res) => {
    try {
        const { country } = req.params;
        const universities = await University.find({ country });
        res.json(universities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/universities/:country/:id', async (req, res) => {
    try {
        const { country, id } = req.params;
        const updatedUniversity = await University.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedUniversity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
