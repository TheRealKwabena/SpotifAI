/*
var express = require("express");
var dotenv = require('dotenv')
var path = require("path");
var cors = require("cors");
var history = require("connect-history-api-fallback");
var morgan = require("morgan")
var port = process.env.PORT || 8080
var app = express()

dotenv.config();

// start the server
app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Backend: http://localhost:${port}/api/`);
  });
  

// Parse requests of content-type 'application/json'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// HTTP request logger
app.use(morgan("dev"));
// Enable cross-origin resource sharing for frontend must be registered before api
app.options("*", cors());
app.use(cors());
app.listen(port, function (err) {
  if (err) throw err;
  console.log(`Express server listening on port ${port}, in ${env} mode`);
  console.log(`Backend: http://localhost:${port}/api/`);
  console.log(`Frontend (production): http://localhost:${port}/`);
});

// Import routes
app.get("/api", function (req, res) {
    res.json({ message: "Welcome to your DIT342 backend ExpressJS project!" });
  });


// Error handler (i.e., when exception is thrown) must be registered last
var env = app.get("env");
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  console.error(err.stack);
  var err_res = {
    message: err.message,
    error: {},
  };
  if (env === "development") {
    // Return sensitive stack trace only in dev mode
    err_res["error"] = err.stack;
  }
  res.status(err.status || 500);
  res.json(err_res);
});
*/
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
var dotenv = require('dotenv')
var path = require("path");
var cors = require("cors");
var querystring = require("querystring")

// Simple route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const PLAYLISTS_URL = 'https://api.spotify.com/v1/me/playlists';

// tep 1: Redirect user to Spotify's authorization page
app.post('/login', (req, res) => {
  const scopes = 'playlist-read-private playlist-read-collaborative';
  const authQueryParams = querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI,
  });
  console.log(authQueryParams)
  res.redirect(`${AUTH_URL}?${authQueryParams}`);
});

// Step 2: Spotify redirects to your callback URL with an authorization code
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  
  try {
    const tokenResponse = await axios.post(TOKEN_URL, querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
    }), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    
    const accessToken = tokenResponse.data.access_token;
    res.redirect(`/playlists?access_token=${accessToken}`);
  } catch (error) {
    console.error('Error fetching access token:', error);
    res.send('Error during authentication.');
  }
});

// Step 3: Use access token to fetch user playlists
app.get('/playlists', async (req, res) => {
  const accessToken = req.query.access_token;

  try {
    const playlistsResponse = await axios.get(PLAYLISTS_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    res.json(playlistsResponse.data);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.send('Error fetching playlists.');
  }
});

// Parse requests of content-type 'application/json'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// HTTP request logger
//app.use(morgan("dev"));
// Enable cross-origin resource sharing for frontend must be registered before api
app.options("*", cors());
app.use(cors());
module.exports = app;