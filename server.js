const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection string
const uri = "xxxxx"; // Replace with your MongoDB connection string
// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a schema for survey data
const surveySchema = new mongoose.Schema({
    school: { type: Number, required: true, min: 1, max: 10 },
    income: { type: Number, required: true, min: 0 },
    transport: { type: Number, required: true, min: 1, max: 10 },
    amenities: { type: Number, required: true, min: 1, max: 10 },
    createdAt: { type: Date, default: Date.now }
  });
  
// Create a model from the schema
const Survey = mongoose.model('Survey', surveySchema);

// API endpoint to handle survey data submission
app.post('/saveSurvey', async (req, res) => {
  try {
    const survey = new Survey(req.body); // Create a new Survey document from the request body
    await survey.save(); // Save the document in MongoDB
    res.status(201).send({ message: 'Survey data saved successfully' });
  } catch (err) {
    console.error('Error saving data:', err); // Log the error
    res.status(500).send({ message: 'Error saving data', error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
