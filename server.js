const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const app = express();

const port = process.env.PORT || 5000;
const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);
const devMiddleware = webpackDevMiddleware(compiler, {
  noInfo: true,
});

app.use(devMiddleware);
app.use(webpackHotMiddleware(compiler));

app.get('*', (req, res) => {
  const file = devMiddleware.fileSystem.readFileSync(path.join(compiler.outputPath, 'index.html'));
  res.send(file.toString());
});

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Development server started. Access URL: http://localhost:' + port);
  }
});
