// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://127.0.0.1:27017/universities', { useNewUrlParser: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());

const modelObj = {
    name: String,
    country: String,
    web_pages: Array,
    domains: Array,
    countryCode: String,
    alpha_two_code: String
}

modelObj['state-province'] = String;

const universitySchema = new mongoose.Schema(modelObj);


const instance = axios.create({
    baseURL: "http://universities.hipolabs.com/",
    timeout: 10000,
    params: {},
});


const getUniversityList = async (country) => {
    try {
        const res = await instance.get(`search?country=${country}`);
        return res;
    } catch (error) {
        console.error(error);
    }
};

const University = mongoose.model('University', universitySchema);

app.post('/api/universities', async (req, res) => {
    try {
        const { name, country } = req.body;

        const universityDataBasedOnCountry = await getUniversityList(country);

        if (universityDataBasedOnCountry.data && universityDataBasedOnCountry.data.length > 0) {

            University.insertMany(universityDataBasedOnCountry.data).then((res1) => {
                console.log(res1);
            }).catch(err => {
                console.log(err, ' error');
            })
        }

        res.status(201).json({ message: 'University data saved successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/universities', async (req, res) => {
    try {
        const { country, province } = req.query;

        let universityData = [];

        if (country && province) {
            universityData = await University.find({ country, 'state-province': province });
        } else if (country) {
            universityData = await University.find({ country });
        } else {
            universityData = await University.find();
        }

        res.status(200).send(universityData);
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

// app.use('/', (req, res) => {
//     console.log('root called');
//     res.status(200).send({ msg: "Root called" });
// })

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
