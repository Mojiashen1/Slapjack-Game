"use strict";

var path = require('path');
var morgan = require('morgan');
var path = require('path');
var express = require('express');
var exphbs  = require('express-handlebars');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultLayout: 'main'
}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined'));

app.get('/', function(req, res) {
  res.render('index');
});

// Here is your new Game!
var Game = require('./game');
var game = new Game();

// var getGameStatus = function() {
//   return {
//     numCards: {
//       game.
//     }
//   }
// }

io.on('connection', function(socket){


  socket.emit('username', false);

  // Try to add a player to the game.
  // If you can't, emit('username', false), return out of callback
  // If you successfully add the player, emit ('username', id)
  socket.on('username', function(data) {
    try {
      var id = game.addPlayer(data);
      socket.playerId = id;
      socket.emit('username', id)
    } catch (exception) {
      console.log(exception);
      socket.emit('username', false)
    }
  });


  // Start the game & broadcast to entire socket
  socket.on('start', function() {
    try{
      game.startGame()
    } catch (exception) {
      socket.emit('message', 'Cannot start game yet')
    }
    socket.emit('start')
    socket.broadcast.emit('start')
  });


  // call game.playCard, emit the result the broadcast it
  socket.on('playCard', function() {
    try{
      var playCard = game.playCard(socket.playerId);
      socket.emit('playCard', playCard);
      socket.broadcast.emit('playCard', playCard);
    } catch (exception){
      socket.emit('message', 'Not your turn yet!')
    }
  });

  // Try to slap! Emit, broadcast, and handle errors accordingly
  socket.on('slap', function() {
    var result;
    try {
      result = game.slap(socket.playerId)
      socket.emit('slap', result);
      socket.broadcast.emit('message', game.players[socket.playerId].username + 'just' + result.message)
      if (result.winning) {
        socket.broadcast.emit('message', game.players[socket.playerId].username + 'just won the game')
      }
    } catch (exception) {
      socket.emit('message', 'Cant slap this')
    }
  });

});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('Express started. Listening on %s', port);
});
