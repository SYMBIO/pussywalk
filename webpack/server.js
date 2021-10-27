import express from 'express';
import webpack from 'webpack';
import open from 'open';

import { SRC, PORT, INDEX, ABSOLUTE_BASE } from './constants';
import config from './webpack.config.dev';

const app = express();
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  stats: {
    colors: true
  }
}));
app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function(req, res) {
  res.sendFile(SRC + req.params[0]);
});

app.listen(PORT, '0.0.0.0', function(err) {
  if (err) {
    console.log(err);
    return;
  }
  open(`http://localhost:${PORT}/`);
  console.log(`Listening at http://localhost:${PORT}`);
  console.log(`Serving ${INDEX}`);
});
