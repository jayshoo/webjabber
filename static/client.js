var notif = window.webkitNotifications;
var socket = io.connect('http://#{config.webHost}:#{config.webPort}/');

var imgRE = /(http[s]*:\/.*?\.(jpg|png|gif))/gi;
var imgurRE = /http:\/\/(?:www\.)?imgur\.com\/(.*)(?:\b)/gi;
var youtubeRE = /http:\/\/(?:www\.)?(?:youtube\.com\/watch\?).*v=(.*)(?:&|$)/;
var youshareRE = /http:\/\/(?:youtu\.be\/)(.*)(?:&|$)/;
var vimeoRE = /http:\/\/(?:www\.)?vimeo\.com\/(\d*)/;
var linkRE = /(>[^<]*?)?(http[s]*:\/\/[^"\s<]*)/;

var popup;
var lastFrom;
var focussed = true;

$(window).focus(function() {
  focussed = true;
  if (popup) popup.cancel();
}).blur(function() {
  focussed = false;
}).keydown(function(e) {
  if (e.which >= 48) {
    $('#message').focus();
  }
});

socket.on('message', function(from, body) {
  if (!body) return;

  from = from.replace(/.*\//, '');
  var fromColor = Crypto.MD5(from, { asBytes: true });
  fromColor = Crypto.util.bytesToHex(fromColor).substr(0, 6);

  if (!focussed && notif && notif.checkPermission() == 0) {
    if (popup) popup.cancel(); 
    popup = notif.createNotification(
      '/icon.png',
      from,
      body);
    popup.show();
  }

  body = body.replace(/</g, '&lt;');
  body = body.replace(/>/g, '&gt;');
  body = body.replace(/\n/g, '<br />');

  body = body.replace(imgRE, '<div class="media"><img src="$1" /></div>');
  body = body.replace(imgurRE, '<div class="media"><img src="http://i.imgur.com/$1.jpg" /></div>');
  body = body.replace(youtubeRE,
    '<div class="media">' +
    '<iframe width="640" height="360" ' +
    'src="http://www.youtube.com/embed/$1" ' +
    'frameborder="0" allowfullscreen></iframe>' +
    '</div>');
  body = body.replace(youshareRE,
    '<div class="media">' +
    '<iframe width="640" height="360" ' +
    'src="http://www.youtube.com/embed/$1" ' +
    'frameborder="0" allowfullscreen></iframe>' +
    '</div>');
  body = body.replace(vimeoRE,
    '<div class="media">' +
    '<iframe width="640" height="360" ' +
    'src="http://player.vimeo.com/video/$1" ' +
    'frameborder="0" allowfullscreen></iframe>' +
    '</div>');
  body = body.replace(linkRE,
    '$1<a href="$2">$2</a>');

  if (from != lastFrom ) {
    var fromImg = '<img class="color" style="background: #'+fromColor+';" />';
    $('#messages').append('<dt>'+fromImg+from+'</dt>');
    lastFrom = from;
  }
  $('#messages').append('<dd>'+body+'</dd>');

  if (scrollY > document.height - 2000) {
    scrollTo(0, document.height + 4000);
  }
});

$(function() {
  $('#messages').hide();
  $('#messageForm').hide();

  $('#loginForm').submit(function() {
    if (notif && notif.checkPermission() != 0) {
      notif.requestPermission();
    }

    var nick = $('#nick').val();

    $('#loginForm').hide();
    $('#messages').show();
    $('#messageForm').show();

    socket.emit('login', nick);
    return false;
  });

  $('#messageForm').submit(function() {
    socket.emit('sendmessage', $('#message').val());
    $('#message').val('');
    return false;
  });
});

