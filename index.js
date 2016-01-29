var PythonShell = require('python-shell');
var mongoose = require('mongoose');
var zerorpc = require('zerorpc');
var colors = require('colors');
var beneficiary = require('./src-node/beneficiary');
var config = require('./config.json');
var db = require('./src-node/db');

// Interactuar con yowsup (python) desde node
var server = new zerorpc.Server({
  input: function(input, reply) {
    console.log('[ ✔✔ ] '.green + input);

    input = JSON.parse(input);
    input.body = (input.body) ? input.body : 'media';

    beneficiary.consult(input.body, (err, res, body) => {
      if (err) {
        // Obtener mensaje desde base de datos
        db.reply(input, (res) => {
          reply(null, res.reply);
        });
      } else {
        // console.log(body); // trabajar json desde servidor
        reply(null, body);
      }
    });
  }
});

server.bind('tcp://0.0.0.0:4242');

// Arrancar mongo
mongoose.connect(config.connect, (e) => {
  if (!e) console.log('[ ok ] connect mongodb'.cyan);
});

var pyshell = new PythonShell('run.py', {
  pythonOptions: ['-u'],
  pythonPath: './python_modules/bin/python',
  scriptPath: './src-python/'
});

pyshell.on('message', (message) => {
  console.log(`${message}`.cyan);
});
