const sharp = require('sharp');
const {createReadStream} = require('fs');
const {join} = require('path');


const mimeTypes = {
  'jpeg': 'image/jpeg',
  'jpg':  'image/jpeg',
  'png':  'image/png',
  'webp': 'image/webp'
};

let rootImages = '';
// let useWebP = false;

const flyimages = (req, res, next) => {

  let options = {
    fit: sharp.fit.cover,
    position: sharp.strategy.entropy
  };

  let matches = req.url.match(/\/(.*\.(jpg|jpeg|png|webp))(?:\/?(\d*)x(\d*)\/?)?/);

  options.width = matches[3] ? parseInt(matches[3]) : null;
  options.height = matches[4] ? parseInt(matches[4]) : null;

  res.setHeader('Expires', new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toUTCString());
  res.setHeader('Cache-control', 'max-age=31536000, public');
  res.setHeader('Last-Modified', new Date().toUTCString());

  if (req.headers['if-modified-since']) {

    res.statusCode = 304;
    res.setHeader('Last-Modified', req.headers['if-modified-since']);
    return res.end();

  } else {

    res.setHeader('content-type', mimeTypes[matches[2]]);

    createReadStream(join(rootImages, matches[1]))
      .on('error', (e) => {
        next();
      })
      .pipe(sharp().resize(options))
      .pipe(res);

  }
}


module.exports = (root, webp = false) => {

  rootImages = root;
  useWebP = webp;

  return flyimages;
}
