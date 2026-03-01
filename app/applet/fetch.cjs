const https = require('https');
https.get('https://pulse-pixel-labs.lovable.app', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(data); });
});
