// http://xmpp.org/extensions/xep-0045.html
var xmpp = require('node-xmpp');
var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);


app.listen(8000);

app.configure(function() {
  app.use(express.static(__dirname + '/static'));
  app.set('views', __dirname);
  app.set('view engine', 'jade');
});

app.get('/', function(req, res) {
  res.render('index', { layout: false });
});


io.sockets.on('connection', function(socket) {

  socket.on('login', function(jid, password, room, nick) {
    var client = new xmpp.Client({
      jid: jid,
      password: password
    });
    client.on('error', function(error) {
      console.log(error);
      socket.emit('error', error);
    });
    client.on('online', function() {
      client.send(new xmpp.Element('presence', {
        to: room+'/'+nick
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
      jid: jid,
      password: password,
      room: room,
      nick: nick
    });
  });

  socket.on('sendmessage', function(text) {
    socket.get('info', function(err, info) {
      var msg = new xmpp.Element('message', {
        from: info.from,
        to: info.room,
        type: 'groupchat'
      }).c('body').t(text);

      info.client.send(msg);
    });
  });

  socket.on('disconnect', function() {
    socket.get('info', function(err, info) {
      info.client.end();
    });
  });

});


/*
cl.on('stanza', function(stanza) {
  if (stanza.is('message')
    && stanza.attrs.type !== 'error'
    && stanza.attrs.from !== conferenceMe
    && stanza.getChild('delay') == undefined) {

    var body = stanza.getChildText('body');

    var msg = new xmpp.Element('message', {
      from: me,
      to: room,
      type: 'groupchat'
    }).c('body').t(body);

    cl.send(msg);
  }
});
*/



