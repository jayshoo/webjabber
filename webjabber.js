// http://xmpp.org/extensions/xep-0045.html
var xmpp = require('node-xmpp');
var http = require('http');

/*
var me = 'jbot@joshu.net/jbot';
var password = 'jbotpassword';
var nick = 'jbot';
var room = 'bowels@conference.vmx9155.hosting24.com.au';

var conferenceMe = room + '/' + nick;
*/

function checkPostedLogin(args) {
  if (args['jid'] === undefined) return undefined;
}

http.createServer(function (req, res) {
  console.log(req);
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

