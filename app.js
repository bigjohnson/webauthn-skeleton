const express       = require('express');
const bodyParser    = require('body-parser');
const cookieSession = require('cookie-session');
const path          = require('path');
const crypto        = require('crypto');

const config        = require('./config');
const defaultroutes = require('./routes/default');
const webuathnroutes  = require('./routes/webauthn');
const tokenroutes   = require('./routes/token');

const app           = express();

app.use(bodyParser.json());

// Sessions
app.use(cookieSession({
  name: 'session',
  keys: [crypto.randomBytes(32).toString('hex')],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Static files (./static)
app.use(express.static(path.join(__dirname, 'static')));

// Routes
app.use('/', defaultroutes);
app.use('/webauthn', webuathnroutes);
app.use('/token', tokenroutes);

const port = config.port || 3000;

// Local development
if (config.mode === "development") {
  const https = require("https");
  const fs = require('fs');
  var privateKey = fs.readFileSync('./keys/key.pem');
  var certificate = fs.readFileSync('./keys/cert.pem');
  https.createServer({
    key: privateKey,
    cert: certificate
  }, app).listen(port);  

// "Production" HTTP - (for use behind https proxy)
} else {
  app.listen(port);

}

console.log(`Started app on port ${port}`);

module.exports = app;
