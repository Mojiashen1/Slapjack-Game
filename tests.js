// "use strict";``
var Game = require('./game');

describe("The Game Object", function() {
  describe(".addPlayer", function() {
    var g;
    beforeEach(function() {
      g = new Game();
    });
    
    it("should create a new player object, add it to the player order, and return the id of the newly created player", function() {
      expect(g.playerOrder.length).toBe(0);
      expect(g.addPlayer('Ethan')).toEqual(jasmine.any(String));
      expect(g.playerOrder.length).toBe(1);
    });
    
    it("should throw an error when trying to add a username of someone already playing", function() {
      g.addPlayer('Ethan');
      expect(function(){g.addPlayer('Ethan');}).toThrow();
    });
    
    it("should throw an error trying to add a player when the game has started", function() {
      g.addPlayer('Ethan');
      g.isStarted = true;
      expect(function(){g.addPlayer('Ethan');}).toThrow();
    });
  });
  
  describe(".startGame", function() {
    var g;
    beforeEach(function() {
      g = new Game();
    });
    
    it("should throw an error if there are less than two people playing", function() {
      expect(g.playerOrder.length).toBe(0);
      g.addPlayer('Ethan');
      expect(function(){g.startGame();}).toThrow();
    });
    
    it("should start the game only if more than two people have been added", function() {
      expect(g.playerOrder.length).toBe(0);
      g.addPlayer('Ethan');
      g.addPlayer('Josh');
      g.startGame();
      expect(g.isStarted).toBe(true);
    });
  });
  
  describe(".isWinning", function() {
    var g;
    beforeEach(function() {
      g = new Game();
    });
    
    it("should throw an error if game has not yet started", function() {
      expect(function(){g.isWinning('');}).toThrow();
    });
    
    it("should return a boolean", function() {
      var id = g.addPlayer('Ethan');
      g.addPlayer('Josh');
      g.startGame();
      expect(g.isWinning(id)).toEqual(jasmine.any(Boolean));
    });
    
  });
  
  describe(".playCard", function() {
    var g;
    beforeEach(function() {
      g = new Game();
    });
    
    it("should throw an error if game has not yet started", function() {
      expect(function(){g.playCard('');}).toThrow();
    });
    
    it("should throw an error if it's not that user's turn", function() {
      var id = g.addPlayer('Ethan');
      g.addPlayer('Josh');
      g.addPlayer('Moose');
      g.addPlayer('Lane');
      g.addPlayer('Darwish');
      g.addPlayer('Abhi');
      g.addPlayer('Lando');
      g.isStarted = true;
      g.currentPlayer = "Josh";
      expect(function(){g.playCard(id);}).toThrow();
    });
    
    it("should throw an error if the user has no more cards", function() {
      g.addPlayer('Ethan');
      var id = g.addPlayer('Josh');
      g.addPlayer('Moose');
      g.addPlayer('Lane');
      g.addPlayer('Darwish');
      g.addPlayer('Abhi');
      g.addPlayer('Lando');
      g.isStarted = true;
      g.currentPlayer = id;
      g.players[id].pile = [];
      expect(g.players[id].pile.length).toBe(0);
      expect(function(){g.playCard(id);}).toThrow();
    });
    
    it("should cycle to the next user after someone has been played a card", function() {
      g.addPlayer('Ethan');
      var id = g.addPlayer('Josh');
      g.startGame();
      g.currentPlayer = id;
      g.playCard(id);
      expect(g.currentPlayer).not.toBe(id);
    });
    
  });
  
  describe(".slap", function() {
    var g;
    beforeEach(function() {
      g = new Game();
    });
    
    it("should throw an error if game has not yet started", function() {
      expect(function(){g.slap('');}).toThrow();
    });
    
    it("should return a boolean", function() {
      var e = g.addPlayer('Ethan');
      var j = g.addPlayer('Josh');
      g.startGame();
      g.playCard(e);
      g.playCard(j);
      g.playCard(e);
      g.playCard(j);
      g.playCard(e);
      g.playCard(j);
      g.playCard(e);
      g.playCard(j);
      expect(g.slap(j)).toEqual(jasmine.any(Boolean));
    });
    
  });

  
});
