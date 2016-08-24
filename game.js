var _ = require('underscore');
var persist = require('./persist');
var readGame = false;

var Card = function(value, suit) {
  this.value = value;
  this.suit = suit;
};

Card.prototype.toString = function() {
  var face = {1:'ace', 11: 'jack', 12: 'queen', 13: 'king'}
  return (face[this.value] || this.value) + ' of ' + this.suit;
};

var Player = function(username) {
  this.username = username;
  this.id = this.generateId();
  this.pile = [];
};

Player.prototype.generateId = function() {
  function id() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return id() + id();
};

var Game = function() {
  this.Card = Card;
  this.Player = Player;
  this.isStarted = false;
  this.currentPlayer = null;
  this.players = {};
  this.playerOrder = [];
  this.pile = [];
};


// Make sure the game is not started and the username is valid
// Add Player to playerOlder
// return player id
Game.prototype.addPlayer = function(username) {
  if (this.isStarted) {
    throw 'Error: game has already started';
  }
  if (username.length === 0) {
    throw "Error: username is empty";
  }
  var players = _.values(this.players);
  players.forEach(function(player) {
    if (player.username === username) {
      throw 'Error: your username is taken';
    }
  })
  if (!this.isStarted) {
    var player = new Player(username);
    this.playerOrder.push(player.id);
    this.players[player.id] = player;
    return player.id;
  }
};


// Use this.playerOrder and this.currentPlayer to figure out whose turn it is next!
Game.prototype.nextPlayer = function() {
  if (!this.isStarted) {
    throw 'Error: game has already started';
  }
  if (this.playerOrder.indexOf(this.currentPlayer) === this.playerOrder.length -1) {
    var nextPlayer = 0;
  } else {
    nextPlayer = this.playerOrder.indexOf(this.currentPlayer) + 1;
  }
  if (this.players[this.playerOrder[nextPlayer]].pile.length !== 0) {
    this.currentPlayer = this.playerOrder[nextPlayer];
    return;
  } else {
    nextPlayer ++;
  }

};


/* Make sure to
  1. Create the Deck
  2. Shuffle the Deck
  3. Distribute cards from the pile
*/
Game.prototype.startGame = function() {
  if (this.isStarted) {
    throw 'Error: game has already started';
  }
  if (this.playerOrder.length < 2) {
    throw "Error: don't play alone! Get friends."
  }
  this.isStarted = true;
  var deck = [];
  var value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  var suit = ['spades', 'diamonds', 'clubs', 'hearts'];
  for (var i = 0; i < value.length; i ++) {
    for (var j = 0; j < suit.length; j ++) {
      deck.push(new Card(value[i], suit[j]));
    }
  }
  deck = _.shuffle(deck);
  var playerNum = this.playerOrder.length;
  var reminder = deck.length % playerNum;
  for (var i = 0; i<reminder; i ++) {
    this.pile.push(deck[i]);
  }

  var averageCards = (deck.length - reminder) / playerNum;
  var nextCard = reminder;
  for (var player in this.players) {
    for (var j = nextCard; j<(averageCards+nextCard); j ++) {
    this.players[player].pile.push(deck[j]);
    nextCard = averageCards + nextCard;
    }
  }
  this.currentPlayer = this.playerOrder[0];
};


// Check if the player with playerId is winning. In this case, that means he has the whole deck.
Game.prototype.isWinning = function(playerId) {
  if (!this.isStarted) {
    throw "Error: game hasn't started";
  }
  if (this.players[playerId].pile.length === 52) {
    this.isStarted = false;
    return true;
  }
  return false;
};

// Play a card from the end of the pile
Game.prototype.playCard = function(playerId) {
  if (!this.isStarted) {
    throw "Error: game hasn't started";
  }
  if (this.currentPlayer !== playerId) {
    throw "Error: it's not your turn yet!"
  }
  if (this.players[playerId].pile.length === 0) {
    throw "Error: you have an empty pile"
  }
  var topCard = this.players[playerId].pile.shift();
  this.pile.unshift(topCard);
  this.nextPlayer();
  return topCard.toString();
};


// If there is valid slap, move all items of the pile into the players Pile,
// clear the pile
// remember invalid slap and you should lose 3 cards!!
Game.prototype.slap = function(playerId) {
  if (!this.isStarted) {
    throw "Error: game hasn't started";
  }
  if (this.pile[0].value === 'jack' || this.pile[0].value === this.pile[1].value || this.pile[0].value === this.pile[2].value) {
    this.pile.forEach(function(card) {
      this.players[playerId].pile.push(card);
    })
    return {
        'winning': this.isWinning(playerId),
        'message': 'got the pile'
      }
  } else {
    this.pile.push(this.players[playerId].pile[0]);
    this.pile.push(this.players[playerId].pile[0]);
    this.pile.push(this.players[playerId].pile[0]);
    return {
      'winning': false,
      'message': 'lost 3 cards!'
    }
  }
};



// PERSISTENCE FUNCTIONS

// Start here after completing Step 2!
// We have written a persist() function for you
// to save your game state to a store.json file.

// Determine in which gameplay functions above
// you want to persist and save your data. We will
// do a code-along later today to show you how
// to convert this from saving to a file to saving
// to Redis, a persistent in-memory datastore!

Card.prototype.fromObject = function(object) {
  this.value = object.value;
  this.suit = object.suit;
}

Card.prototype.toObject = function() {
  return {
    value: this.value,
    suit: this.suit
  };
}


Player.prototype.fromObject = function(object) {
  this.username = object.username;
  this.id = object.id;
  this.pile = object.pile.map(function(card) {
    var c = new Card();
    c.fromObject(card);
    return c;
  });
}

Player.prototype.toObject = function() {
  var ret = {
    username: this.username,
    id: this.id
  };
  ret.pile = this.pile.map(function(card) {
    return card.toObject();
  });
  return ret;
}

Game.prototype.fromObject = function(object) {
  this.isStarted = object.isStarted;
  this.currentPlayer = object.currentPlayer;
  this.playerOrder = object.playerOrder;

  this.pile = object.pile.map(function(card) {
    var c = new Card();
    c.fromObject(card);
    return c;
  });

  this.players = _.mapObject(object.players, function(player) {
    var p = new Player();
    p.fromObject(player);
    return p;
  });
}

Game.prototype.toObject = function() {
  var ret = {
    isStarted: this.isStarted,
    currentPlayer: this.currentPlayer,
    playerOrder: this.playerOrder
  };
  ret.players = {};
  for (var i in this.players) {
    ret.players[i] = this.players[i].toObject();
  }
  ret.pile = this.pile.map(function(card) {
    return card.toObject();
  });
  return ret;
}

Game.prototype.fromJSON = function(jsonString) {
  this.fromObject(JSON.parse(jsonString));
}

Game.prototype.toJSON = function() {
  return JSON.stringify(this.toObject());
}

Game.prototype.persist = function() {
  if (readGame && persist.hasExisting()) {
    this.fromJSON(persist.read());
    readGame = true;
  } else {
    persist.write(this.toJSON());
  }
}

module.exports = Game;
