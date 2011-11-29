var xmpp = require('node-xmpp');
var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);

var config = require('./config');

app.listen(config.webPort);

app.configure(function() {
  app.use(express.static(__dirname + '/static'));
  app.set('views', __dirname);
  app.set('view engine', 'jade');
});

app.get('/', function(req, res) {
  res.render('index', { layout: false });
});


io.sockets.on('connection', function(socket) {

  socket.on('login', function(nick) {
    var client = new xmpp.Client({
      jid: config.jabberId,
      password: config.jabberPassword
    });
    client.on('error', function(error) {
      console.log(error);
      socket.emit('error', error);
    });
    client.on('online', function() {
      client.send(new xmpp.Element('presence', {
        to: config.jabberConference+'/'+nick
      }));
    });
    client.on('stanza', function(stanza) {
      if (stanza.is('message')
      && stanza.attrs.type !== 'error')
      {
        var from = stanza.attrs.from;
        var body = stanza.getChildText('body');

        socket.emit('message', from, body);
      }
    });

    socket.set('info', {
      client: client,
      nick: nick
    });
  });

  socket.on('sendmessage', function(text) {
    socket.get('info', function(err, info) {
      var msg = new xmpp.Element('message', {
        from: config.jabberId,
        to: config.jabberConference,
        type: 'groupchat'
      }).c('body').t(text);

      info.client.send(msg);
    });
  });

  socket.on('disconnect', function() {
    socket.get('info', function(err, info) {
      if (info !== null && info.client !== null)
        info.client.end();
    });
  });

});

