# Slapjack
Today, we'll be doing a fun project - implementing the multiplayer card game _Slapjack_ in a way that will allow us to deploy to Heroku and play with your friends. 

## Table of Contents

* **Rules of Slapjack** 🃏
* **Step 1:** Game Logic ♠️
* **Step 2:** Displaying Your Game ♥️
* **Step 3:** Persistence, Sessions, and Redis ♣️
* **The End:** Deploy, deploy, deploy! ♦️

## Rules of Slapjack 🃏
In Slapjack, the objective of the game is to have the entire deck of cards.

At the beginning of a game of Slapjack, each player is dealt an equal number of cards facedown (players are not able to see their own cards or anyone else's cards). 

The remaining cards go to a central pile. Players will then go in order, playing their cards to the pile until they reach 52 cards (_the winning condition of the game_) or have no more cards left to deal. 

Players can gain cards by "slapping" the pile - in which case they either gain the pile or lose 3 cards based on the following conditions:

* If the top card of the pile is a Jack, the player gains the pile
* If the top two cards of the pile are of the same value (i.e., two Aces, two 10's, two 2's), the player gains the pile
* If the top card and third-to-top card are of the same value (sandwich - i.e. Ace 10 Ace, 10 Ace 10), the player gains the pile
* Otherwise, the player loses 3 cards to the top of the pile

Additionally, only one person can slap a winning pile; all players slapping immediately after the first lose 3 cards.

## Step 1: Game Logic ♠️
We will isolate all of your Slapjack game's logic into a single module inside of `game.js`. Before you begin, make sure to run `npm install` to get all the dependencies you need to both start and test the application. In this step, you won't ever need to `npm start` - just run `npm test` when prompted to! In the next step, we'll be serving up the game to your connected users.

### Cards and Players 🦄 - `game.js`
Begin with your `Card` object - we should only have two properties and a function for any given `Card` object:

* The value of the playing card, from 1-13 (where Ace is 1, Jack is 11, Queen is 12, King is 13)
* The suit of the playing card, which any one of the following: _hearts_, _spades_, _clubs_, or _diamonds_.
* A `toString` function that allows us to get the human-readable description for the card, i.e. _Ace of Spades_, _8 of Hearts_, etc.

Next, build out your `Player` object - your `Player` object should have three properties:

* A unique username
* A unique ID - generated upon construction
* A pile/hand of cards represented by an Array of `Card` objects

You want to create some basic properties for your `Game` object as well - below is a brief explanation of each property you need to create and how you'll be using them:

* A Boolean to check if the game is in progress or not
* A String to store the ID of the current player whose turn it is to play a card
* An Object to store the `Player` objects by the key of an ID and value of a `Player` object
	* You should be able to access `Player`s from this object with `players[id]`.
* An Array of IDs of players, representing their order in the game.
* An Array of `Card` objects representing the central pile.

Now that you have the fundamental properties for keeping track of Game state, add the definition for a `Game` prototype to allow for adding players into the game.

* `Game.prototype.addPlayer` - should take a `username` as a String
	* Throw an error if the game has already started
	* Throw an error if the username is empty
	* Throw an error if the player's username is non-unique
	* Otherwise, create a new `Player` object with a username and push its ID `playerOrder` Array and add the new `Player` to the `players` Object
	* Return the ID of the new `Player`

> **Test:** At this point, run `npm test` to check your progress and verify that your methods are working!


### Game Starter 💥 - `game.js`

Next, we'll tackle the game logic for setting up a game. Implement the following function to handle setting up a new game:

* `Game.prototype.startGame` - begin game setup
	* Throw an error if the game has already started
	* Throw an error if the game has fewer than two people added
	* Otherwise, set your `isStarted` (or equivalent) boolean to `true`
	* Create a standard deck of 52 playing cards and shuffle them
		* **Hint:** You may find Underscore's `.shuffle` method helpful for implementing a Fisher-Yates shuffle!
	* Distribute the cards evenly amongst all players and place the remaining cards in the game pile
	* Set the current Player ID variable to the first person in the Player order
	
To finish setup, implement the following function to allow you to change your current Player ID variable as you move through your game in the functions to follow:

* `Game.prototype.nextPlayer` - move to next Player ID in Player order Array
	* Throw an error if the game is not already started
	* Find the next Player able to play (a Player with a non-zero pile length) in the Player order Array
	* Set the next Player available to the current Player ID variable

> **Test:** At this point, run `npm test` to check your progress and verify that your methods are working!

### Gameplay Functions 🚧 - `game.js`
Time to implement the most important functions to support your Game - the gameplay functions! Use the following stubs to write your gameplay functions:

* `Game.prototype.isWinning` - should take a Player ID and return whether or not the Player corresponding to that ID has won
	* Throw an error if the game is not already started
	* Check for a winning condition of a Player corresponding to the `playerId` passed in and, if a win occurred, set your `isStarted` Boolean or equivalent to `false` and return true.
	* Otherwise, return `false` - the Player did not meet a winning condition.
	
* `Game.prototype.playCard` - should take a Player ID of the Player attempting to play a Card and return a String representation of the card played
	* Throw an error if the game is not already started
	* Throw an error if the current Player ID variable does not match the passed-in Player ID (this means a player is attempting to play a card out of turn)
	* Throw an error if the Player corresponding to the passed-in Player ID has a pile length of zero
	* Otherwise, move the top card of a Player's pile onto the top card of the Game pile.
	* Call `this.nextPlayer()` to set the next player's ID to the current Player ID variable.
	* Return a String representation of the Card that was played.

* `Game.prototype.slap` - should take a Player ID of the Player attempting to slap and return an Object (format described below)
	* Throw an error if the game is not already started
	* Check for any of the winning slap conditions 
		* If the top card of the pile is a Jack
		* If the top two cards of the pile are of the same value
		* If the top card and third-to-top card are of the same value (sandwich)
	* If there is a winning slap condition, move the pile into the back of the pile of the Player corresponding to the passed-in Player ID
		* Call `this.isWinning()` with the passed-in Player ID to check for a game win
		* Return an object with property `winning` as the result of `this.isWinning` and property `message` of "got the pile!"
	* Otherwise, take the top 3 cards from the pile of the Player corresponding to the passed-in Player ID and add it to the bottom of the game pile
		* Return an object with property `winning` as `false` and property `message` of "lost 3 cards!"

> **Test:** At this point, run `npm test` to check your progress and verify that your methods are working!

## Step 2: Displaying Your Game ♥️
Now that your game is setup and running, we are going to build out the front end of it so that your game doesn't just live in a variable on your Node server, but communicating with all connected clients and updating their views simultaneously. 

### Sending WebSockets Events ☝️ - `app.js`
First, a little crash course on using the [socket.io](http://socket.io) library we are using to send and receive events between our clients and server with WebSockets:

All messages sent between client and server on WebSockets happens in terms of "events" that are emitted and received. On both the client and server, `emit` sends an event back _to_ the other, and `.on` creates a handler to receive an event _from_ the other. For example:

<sub>Client</sub>

```javascript
socket.emit("cake", "Here is some strawberry cake"); // 1
socket.on("cake", function(data) {
	// Alerts with "The server said thank you for cake"
	alert("The server said " + data); // 4
})
``` 
<sub>Server</sub>

```javascript
socket.on("cake", function(data) {
	console.log(data); // Logs "Here is some strawberry cake" // 2
	socket.emit("cake", "thank you for cake"); // 3
});
```

Super simple, and fast! **Note that `socket.emit` only emits to one connected socket at a time** (where each client is represented by a single socket). 

To **broadcast an event** to all connected clients, call `socket.broadcast.emit` with the same parameters.

Below is a spec of the events that we want to emit back to the client and respond to from the client: use the scaffold to update game logic within these events and pass back to the client necessary game information.

#### Getting and Setting the Username

1. **Server Receive (`app.js`):** `connection` (when a client initially connects)
	* Immediately emit a `username` event back to the client with `false`

* **Client Receive (`views/index.js`):** `username`
	* If the data passed in is `false`, prompt (you can use `.prompt` to get input) the user for a username and save it. Then, emit a `username` event back with the saved username.
	* Otherwise, save the response. If the response is not `false`, it is your client's player's ID.

* **Server Receive (`app.js`):** `username` (receives String, username)
	* Attempt to add the user to the game
	* If the game throws an error, emit back `username` with `false`
	* Otherwise, set `socket.playerId` equal to the new ID of the player and emit back `username` with the new ID (received back from `addPlayer`)
	
#### Starting the Game
1. **Server Receive (`app.js`):** `start`
	* Attempt to start the game
	* If the game throws an error, emit back `message` with "Cannot start game yet!"
	* Otherwise, emit a `start` event and broadcast a `start` event to all clients
	
* **Client Receive (`views/index.js`):** `start`
	* Disable your Start Game button (_hint: you have jQuery!_)
	
#### Playing the Cards Right
1. **Server Receive (`app.js`):** `playCard`
	* Attempt to call `playCard` with `socket.playerId` (which you set earlier on the `username` event)
	* If the game throws an error, emit back `message` with "Not your turn yet!"
	* Otherwise, emit a `playCard` event and broadcast a `playCard` event with the return result of `game.playCard` (the new Card just played).
	
* **Client Receive (`views/index.js`):** `playCard` (receives a String representation of the Card just played)
	* Update your view to display a card - you will be only showing one card in the pile at a time. 
	* **Note:** We have placed some nice, open-source SVG graphics of cards named like `10_of_spades.svg`, `ace_of_hearts.svg`, etc. Update the `src` of an `<img>` element! - perhaps with the data you receive from a `playCard` event? Think about how you will turn "King of hearts" to simply "king_of_hearts.svg"!	

#### Slap!
* **Server Receive (`app.js`):** `slap`
	* Attempt to call `slap` with `socket.playerId` (which you set earlier on the `username` event)
	* If the game throws an error, emit back `message` with the error (note: a failed slap does not throw an error!)
	* Otherwise, emit a `slap` event with the return result of `game.slap` and broadcast a `message` event with "_their username_ just " + `[*return result game.slap*].message`, i.e. "Ethan just lost 3 cards!" or "Ethan just won the pile!"
		* **Note:** if the return result of `game.slap` is `true`, broadcast a `message` event with "_their username_ just won the game!"
		
	
* **Client Receive (`views/index.js`):** `slap`
	* If the `response.winning` property is `true`, display a message saying that you won!
	* Otherwise, display a temporary message on the screen with the data received (from the `response.message`) for 5 seconds - if using jQuery, select the element and call `fadeOut` on it
		* This message will be either "lost 3 cards!" or "won the pile!" - since you are the only one handling this event, you can append "You" to the message to make it "You lost 3 cards!" or "You won the pile!"


#### Getting Messages
* **Client Receive (`views/index.js`):** `message`
	* Display a temporary message on the screen with the data received for 5 seconds - if using jQuery, select the element and call `fadeOut` on it.
	
#### Updating Other Game State Properties

First you will need to create a function at the beginning of your `app.js` file, after you define the `new Game()` called `getGameStatus()`. This should return an object with the fields below:

- `numCards`: an Object with the keys as playerIds and the value as the number of Cards
- `currentPlayerUsername`: the username of the current players name
- `playersInGame`: A string with the name of all the players in the game
- `cardsInDeck`: How many cards are in the current pile

Next you will need to emit this information to the client by creating a new event called `updateGame`. `updateGame` will  back the above information to all clients so that each player is looking at the game in the same state. 

* **Server Send (`views/index.js`):** `updateGame`
	* Upon important user actions, such as `username` (a new Player entering the game), `playCard` (a Card being played by a user), and `slap` (any time a Player attempts a slap), we want to emit this event with the return result of `getGameStatus()`.
	* Both emit and broadcast `updateGame` after these user actions so that all connected clients receive an up-to-date game state.

* **Client Receive (`views/index.js`):** `updateGame`
	* When receiving an `updateGame` event, you will use the information you received, to then populate the game state fields in html. Below is sample code of a helper function that takes  `state` passed from the received `updateGame` event and updates the content of the page accordingly.
	
	```javascript
	function updateGameStatus(state){
		$(".username").text(username);
		$(".numCards").text(state.numCards[id]);
		$(".playerNames").text(state.playersInGame);
		$(".currentPlayerUsername").text(state.currentPlayerUsername);
		$(".cardsInDeck").text(state.cardsInDeck);
		$(".num").show();
		window.state = state;
	}
	```
	
## Step 3: Persistence, Sessions, and Redis ♣️

### Implementing Sessions

#### Persisting the ID for the Client - `views/index.hbs`
You may have noticed during testing that every time you refreshed your browser while the server was running, it would prompt you for another username, not allowing you to jump back into the game as the same user you played with before. We will implement a simple form of sessions using unique IDs.

We will store unique IDs in `LocalStorage`. [`LocalStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is a mechanism for storing key-value pairs in the browser on a per-website basis. When we get back a unique User ID from the server with the `username` event, we will store it in `LocalStorage` rather than in a variable. To set something with a browser's `LocalStorage` looks like the following:

```javascript
localStorage.setItem("cake", "strawberry"); // first parameter is key, second parameter is value
```

Getting an item back from `LocalStorage` is very similar; just change the name of the method to `getItem` and pass in a key:

```javascript
var cake = localStorage.getItem("cake"); // variable cake is now "strawberry"
```

Note that if `getItem` is called with a key that is not defined or found in `LocalStorage`, it will return null. Thus, rather than initially setting our ID variable of the user playing to an empty string, we want something along the lines of:

```javascript
var id = localStorage.getItem("id") || "";
```

Here, if `LocalStorage` does not have our item, `id` will be set to empty string.

Wrap your existing `.on` event handler for a received `username` event into a conditional that checks if `localStorage.getItem("id")` is null - this means that the user has not played yet and we need to prompt for a username. Additionally, when we initially get an ID back from the `username` event now, **we want to make sure that we are saving it** to `LocalStorage` with `setItem`.

In the case where `localStorage.getItem("id")` is non-null, on the other hand, we need to send an event back to the server presenting an ID of a currently playing user. To make the distinction between a new player and an existing player attempting to re-join, we will emit a `username` event with an Object formatted like the following to the server:

`{ id: "XXXXXXXXX" }`

We'll deal with re-associating the new `socket` connection with the existing player in the next section.

#### Re-setting the ID on the Server - `app.js`

Modify the `username` event handler on the server to check if we are receiving a String (in which case, a new user is attempting to join the game) or if we are receiving an Object with an ID (in which case, an existing user is re-joining the game).

Your new `username` event halder should:

1. If the data received is a String, do the same thing as before.
2. Otherwise, if the `data` we receive is an Object, set `socket.playerId` to `data.id`. Now, additional calls to `slap` or `playCard` will be using the correct Player ID. Finally, send (i.e. emit) back `start` and `updateGame` events to initialize the game state of the player who is re-joining.


### Implementing Persistence

Go to the bottom of your `game.js` file and take a look at the persistence functions we have built in for you. Determine where you need to call `this.persist()` in your game to save the game state!

Later today, we will have a code-along to show you how to save to Redis, a persistent in-memory data store rather than a simple JSON file.

# Slapjack-Game
