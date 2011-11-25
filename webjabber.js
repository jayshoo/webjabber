// http://xmpp.org/extensions/xep-0045.html
var xmpp = require('node-xmpp');
var qs = require('querystring');
var http = require('http');

function login(args) {
  var keys = ['jid', 'password', 'room', 'nick'];
  for (ind in keys) {
    if (args[keys[ind]] === undefined)
      return undefined;
  }

  var cl = new xmpp.Client({
    jid: args.jid,
    password: args.password
  });

  // send presence to the desired chat asap
  cl.on('online', function() {
    cl.send(new xmpp.Element('presence', {
      to: args.room+'/'+args.nick
    }));
  });
  cl.on('error', function(error) {
    console.log(error);
  });

  return cl;
}

function initialConnection(client, req, res) {
  var query = '';
  req.on('data', function(data) {
    query += data;
  });
  req.on('end', function() {
    var args = qs.parse(query);

    client = login(args);
    if (client === undefined) {
      console.log('client was undefined');
      console.log(args);

      res.writeHead(400);
      res.end();
      return;
    }

    handleMessages(client, req, res);
  });

  res.writeHead(200, {
    'Transfer-Encoding': 'chunked'
  });
}

function handleMessages(client, req, res) {
  var query = '';
  req.on('data', function(data) {
    query += data;
  });
  req.on('end', function() {
    var args = qs.parse(query);
    query = '';
  });
  client.on('stanza', function(stanza) {
    if (stanza.is('message')
    && stanza.attrs.type !== 'error') {
      var body = stanza.getChildText('body');
      if (body !== null) {
        console.log(body);
        res.write(body);
      }
    }
  });
}

http.createServer(function (req, res) {
  var client;
  initialConnection(client, req, res);

  res.end();
}).listen(8005);


/*
var cl = new xmpp.Client({
  jid: me,
  password: password
});

cl.on('online', function() {
  cl.send(new xmpp.Element('presence', {
    to: conferenceMe
  }));
});

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

