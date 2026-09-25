'use strict'

//-------------

require('dotenv').config();

//--
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const path = require('path');
const fs = require('fs');

app.use(bodyParser.json());

//---- CORS policy - Update this section as needed ----

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  next();
});

//-------

const servicePhoneNumber = process.env.SERVICE_PHONE_NUMBER;
console.log("Service phone number:", servicePhoneNumber);

//--- Vonage API ---

const { Auth } = require('@vonage/auth');

const credentials = new Auth({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  applicationId: process.env.APP_ID,
  privateKey: './.private.key'    // private key file name with a leading dot 
});

const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage(credentials);

//------------

// Directory where mp3/wav files are stored
const AUDIO_DIR = path.join(__dirname, 'audio');

//============= Processing inbound PSTN calls ===============

//-- Incoming PSTN call --
 
app.get('/answer', async(req, res) => {

  const hostName = req.hostname;

  const nccoResponse = [
    {
      "action":"stream",
      "streamUrl": [`https://${hostName}/streams/announcement-1.mp3`]
    }
  ];

  res.status(200).json(nccoResponse);

});

//------------

app.post('/event', async(req, res) => {

  res.status(200).send('Ok');

});

//------------

// Serve audio files with Cache-Control headers
app.get('/streams/:file', (req, res) => {
  
  const filename = req.params.file;
  const filePath = path.join(AUDIO_DIR, filename);

  // Basic path traversal protection
  if (!filePath.startsWith(AUDIO_DIR)) {
    return res.status(400).json({ error: 'Invalid file path' });
  }

  // Check file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }

  // Only allow MP3 and WAV (formats supported by Vonage stream action)
  const ext = path.extname(filename).toLowerCase();
  if (!['.mp3', '.wav'].includes(ext)) {
    return res.status(415).json({ error: 'Unsupported file type. Use MP3 or WAV.' });
  }

  const contentType = ext === '.mp3' ? 'audio/mpeg' : 'audio/wav';

  res.set({
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=360000',  // ~100 hours - Adjust accordingly to your needs
  });

  res.sendFile(filePath);
});


//--- If this application is hosted on VCR (Vonage Code Runtime) serverless infrastructure (aka Neru) --------

app.get('/_/health', async(req, res) => {

  res.status(200).send('Ok');

});

//=========================================

const port = process.env.VCR_PORT || process.env.PORT || 8000;

app.listen(port, () => console.log(`Voice API application listening on port ${port}`));

//------------
