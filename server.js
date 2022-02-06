const express = require('express'); 
const cors = require('cors')
const app = express(); 
const httpServer = require('http').createServer(app); 
const path = require('path');
const io = require("socket.io")(httpServer, {
    cors: {
      origin: "https://anthemy.herokuapp.com",
      methods: ["GET", "POST"]
    }
  });

/** class representing a room */
class Room {
    /**
     * creates the class
     * @param {*} roomNumber starts at 1, this is how the room is accessed
     */
    constructor(roomNumber) {
        this.roomNumber = String(roomNumber); 
        this.clients = []; 
    }

    /**
     * easier way to know if the room has 2 clients
     * @return Boolean
     */
    isFull() {
        return this.clients.length === 2; 
    }

    /**
     * Socket object joins the room
     * Client info updates room number
     * Awaiting connection is updated
     * Adds client info to this.clients
     * Sends client info to the socket's new room
     * Sends room info to the socket's new room
     * @param {socket} socket this is the socket object that the server uses
     */
    addMember(socket) {
        socket.join(this.roomNumber); 
        clients[socket.id]['roomNumber'] = this.roomNumber;
        this.clients.push(socket.id);
        // clients[socket.id]['socketId']]['awaitingConnection'] = (this.isFull()) ? false: true;  
        clients[socket.id]['awaitingConnection'] = (this.isFull()) ? false: true;  
        if (this.isFull()) {
            io.to(this.roomNumber).emit('sendClientInfo', [clients[this.clients[0]], clients[this.clients[1]]]); 
        }
        else {
            io.to(this.roomNumber).emit('sendClientInfo', [clients[this.clients[0]]]); 
        }
        // io.to(this.roomNumber).emit('sendClientInfo', this.getMembers());
        io.to(this.roomNumber).emit('send room', [this.roomNumber]); 
        io.to(this.roomNumber).emit('send disconnect', `${clients[socket.id]['userName']} has connected at ${getTime()}`); 
    }

    /**
     * Changes awaitingConnection to true
     * Updates clients to remove the socket
     * Socket leaves the room
     * @param {socket} socket this is the socket object that the server uses
     */
    removeMember(socket) { 
        console.log(`room ${this.roomNumber} is removing socket ${socket.id}`);
        clients[socket.id]['awaitingConnection'] = true; 
        if (this.isFull()) {
            if (this.clients[0]['socketId'] === socket.id) {
                this.clients = this.clients.splice(1, 1)
            }
            else {
                this.clients = this.clients.splice(0, 1)
            }
            // console.log(this.clients); 
            clients[this.clients[0]]['awaitingConnection'] = (this.isFull()) ? false: true;  
        }
        else {
            this.clients = []; 
        }
        console.log(socket.id + ' left'); 
        socket.leave(clients[socket.id]['roomNumber']);
        io.to(this.roomNumber).emit('sendClientInfo', [clients[this.clients[0]]]);
        io.to(this.roomNumber).emit('send disconnect', `${clients[socket.id]['userName']} has disconnected at ${getTime()}`)   
    }

    /**
     * returns client ifno
     * @returns Array
     */
    getMembers() {
        return this.clients; 
    }

    /**
     * returns number of clients in a room
     * @returns Number
     */
    getNumberMembers() {
        return this.clients.length; 
    }
}


app.use(express.static(path.resolve(__dirname, './files/static'))); 
app.use(express.json())

app.use(cors());

app.get('/', (req, res) => {
    console.log('someone went back to the landing page'); 
    console.log('concurrent users: ' + io.engine.clientsCount); 
    console.dir(req.ip); 
    res.sendFile(path.resolve(__dirname, './files/landing.html')); 
});

app.get('/criteria', (req, res) => {
    console.log('someone chose a new criteria'); 
    res.sendFile(path.resolve(__dirname, './files/criteria-selection.html')); 
});

app.get('/chat', (req, res) => {
    res.sendFile(path.resolve(__dirname, './files/new_chat.html'));
});

app.get('/statistics', (req, res) => {
    res.sendFile(path.resolve(__dirname, './files/statistics.html'));
});

app.get('/client-info', (req, res) => {
    res.json({'client_id': '4c0788b9290a4b14ad612e1483cb4e35', 'client_secret': 'd2b9fcf6dc0d44d29fd48e62bab6e4e5'});
});

// returns a json of the number of users in each section of the chat by iterating
// through the clients object 
app.get('/users', (req, res) => {
    let users = Object.keys(clients); 
    console.log(users); 
    let criteria = {'random': 0, 'topAlbums': 0, 'topArtists': 0, 'topSongs': 0, 'topGenres': 0}
    users.forEach(user => {
        console.log(user); 
        try {
            console.log(clients[user]['criteria']); 
            criteria[clients[user]['criteria']] += 1    
        }
        catch {
            console.log(`${user} has no criteria`); 
        }
    }); 
    res.send(criteria); 
}); 

app.post('/visit-tracker', (req, res) => {
    try {
        console.log("device type: " + req.body.deviceType);
    } 
    catch {
        console.log('eh, who even cares what kind of device they are on'); 
    }
}); 


var roomNumber = 0; 
var rooms = []; 
var clients = {};
var waitingForData = false; 

/**
 * Creates a new room and makes the socket join that room whilst removing the socket's old room
 * if it has one defined
 * @param {*} socket the socket object that is mainly used
 */
const createJoinNewRoom = (socket) => {
    let createdRoom = new Room(rooms.length + 1);
    let oldRoomNumber = clients[socket.id]['roomNumber'];
    if (oldRoomNumber != null) {
        rooms[oldRoomNumber - 1].removeMember(socket);
    }
    createdRoom.addMember(socket); 
    rooms.push(createdRoom); 
}

// }
/**
 * Sends all of the client information for all of the clients in the room to the room that the client is in 
 * Using an emit event
 * @param {Object} data 
 */
const sendStoredData = (data) => {
    io.to(data['roomNumber']).emit('sendClientInfo', rooms[data['roomNumber'] - 1].getMembers()); 
}

/**
 * For all of the clients connected who set their search preference to the same one that the client has, 
 * this function iterates through the values of that preference to see if there are any similarities
 * and returns a sorted JSON that has the client information of the most similar clients
 * @param {socket} socket the socket object that is mainly used
 * @param {Object} clients the list of clients
 * @returns Object
 */
const getSimilarity = (socket, clients) => {
    // console.log(clients); 
    let client = clients[socket.id]; 
    let similarMethodClients = {}; 
    let similarClients = {}; 
    // console.log(client)
    let method  = client['criteria'];
    let clientTaste = new Set();
    
    // adding stringified JSON to the set so we can match because it won't match if they are regular objects
    console.log(method); 
    if (method !== 'random') {
        for (let i = 0; i < client[method].length; i++) {
            clientTaste.add(JSON.stringify(client[method][i])); 
        }
        // console.log(`client criteria values are ${new Set(client[client['criteria']])}`); 
        // console.log(Object.keys(clients).length);
    }
    
    // if there are clients stores, iterate through them and find ones that are similar
    if (Object.keys(clients).length !== 0) {
            for (let iterClient in clients) {
                // if the client has the same search criteria and isn't the client that's looking, create a 
                // Set of all of the criteria values and compare them with the other clients
                if (clients[iterClient]['criteria'] === method && clients[iterClient]['socketId'] !== socket.id) {
                    similarMethodClients[iterClient] = new Set();
                    // random method doesn't have to account for similarity
                    if (method !== 'random') {
                        for (let i = 0; i < clients[iterClient][method].length; i++) {
                            similarMethodClients[iterClient].add(JSON.stringify(clients[iterClient][client['criteria']][i]));
                        }                        
                    }
                    else {
                        // all of the clients will have the same simiilarity to a random one
                        clientTaste.add(1); 
                        similarMethodClients[iterClient].add(1);
                    }
                }
            }
        console.log(`similar method clients length ${Object.keys(similarMethodClients).length}`);
        // if there are any similar clients, find the ones that are the most similar
        if (Object.keys(similarMethodClients).length !== 0) {
            for (let similarIterClient in similarMethodClients) {
                // similarIterClient is just the socket.id of the similar client
                var similarCriteria = [];
                clientTaste.forEach(criteria => {
                    // console.log(similarMethodClients[similarIterClient].has(criteria)); 
                    if (similarMethodClients[similarIterClient].has(criteria)) {
                        similarCriteria.push(criteria); 
                    }
                    // similarClients is basically a duplicate 
                    similarClients[similarIterClient] = {};
                    similarClients[similarIterClient]['roomNumber'] = clients[similarIterClient]['roomNumber']; 
                    similarClients[similarIterClient]['similarClientId'] = similarIterClient; 
                    if (method !== 'random') {
                        similarClients[similarIterClient]['similarItems'] = similarCriteria;
                        similarClients[similarIterClient]['similarItemsCount'] = similarCriteria.length;  
                    }
                }); 
            }
            // sort out the most similar ones by value of similar datapoints so we can know which room to join 
            let sortedSimilarClients = Object.values(similarClients).sort((a, b) => parseFloat(b.similarItemsCount) - parseFloat(a.similarItemsCount)); 
            return sortedSimilarClients; 
        }
        else {
            return {}
        }
    }
    else {
        return {}; 
    }
}



/**
 * Takes the output of getSimilarity() and either joins the room of the most similar and available client, or 
 * creates a new room if there aren't any available
 * @param {*} socket the socket object that is mainly used
 * @param {*} sortedSimilarClients the output of getSimilarity()
 * @returns nothing because it uses return as a way to exit the function when the socket joins a room so that it doesn't
 * jon multiple rooms
 */

const joinRoom = (socket, sortedSimilarClients) => {
    console.log(Object.keys(sortedSimilarClients).length);
    if (Object.keys(sortedSimilarClients).length < 1) {
        console.log('creating new room'); 
        createJoinNewRoom(socket);
        return 
    }
    for (let sortedClient in sortedSimilarClients) {        
        // if the client is awaiting connection, join the room
        let similarclient = clients[sortedSimilarClients[sortedClient]['similarClientId']]
        if (similarclient['awaitingConnection'] === true && similarclient['roomNumber'] !== clients[socket.id]['roomNumber']) {
            console.log('found awaiting connection'); 
            // if the socket is already in another room, we need to remove it from that room
            if (clients[socket.id]['roomNumber'] != null) {
                rooms[clients[socket.id]['roomNumber'] - 1].removeMember(socket);
            }
            // if the room isn't full, the user can join the room and we exit out of the joinRoom function
            if (!rooms[similarclient['roomNumber'] - 1].isFull()) {
                rooms[clients[sortedSimilarClients[sortedClient]['similarClientId']]['roomNumber'] - 1].addMember(socket);
                console.log('joining existing room'); 
                return 
            }
        }
    }
    // if the user hasn't joined a room at this point, the server creates a new room for it
    console.log('could not find any similar clients outside of the current room'); 
    createJoinNewRoom(socket); 
}

// this is the main loop that contains all of the socket events
io.sockets.on('connection', (socket) => {

    console.log('device type + ' + deviceType()); 
    console.log('concurrent users: ' + io.engine.clientsCount); 
    // sockets are accessed by their ID
    // when a socket joins, it is awaiting connection
    clients[socket.id] = {}; 
    clients[socket.id]['socketId'] = socket.id;
    // console.log(clients); 
    clients[socket.id]['awaitingConnection'] = true;    
    console.log(`rooms: ${rooms}`); 
   

   socket.on('requestClientInfo', () => {
        sendStoredData(clients[socket.id]); 
   }); 

   // all "store" functions take data that is being sent by the client and stores it in the clients object
   socket.on('storeTopArtists', (data) => {
        try {
            clients[socket.id]['topArtists'] = data;
            // console.log(`top artist ${clients[socket.id]['topArtists'][0]}`);
        }
        catch {
            console.log('data is null')
        }
   });

   socket.on('storeTopGenres', (data) => {
        clients[socket.id]['topGenres'] = data;
        // console.log(`top genre ${clients[socket.id]['topGenres'][0]}`); 
   });

   socket.on('storeUserName', (data) => {
        clients[socket.id]['userName'] = data;
        io.to(clients[socket.id]['roomNumber']).emit('send disconnect', data + ' has joined at ' + getTime()); 
        console.log(`username ${clients[socket.id]['userName']}`); 
   });

   socket.on('storeTopAlbums', (data) => {
        clients[socket.id]['topAlbums'] = data;
        // console.log(`top album ${clients[socket.id]['topAlbums'][0]}`); 
   }); 

   socket.on('storeTopSongs', (data) => {
        clients[socket.id]['topSongs'] = data;
        // console.log(`top song ${clients[socket.id]['topSongs'][0]}`); 
   });
 
   // the client emits a 'chat message' event with the text content of the message, the room it came from,
   // and the name of the client that sent it. the server then sends that message content to everyone in the
   // room that way both clients can see it
   socket.on('chat message', (msg, room, name) => {
    io.to(room).emit('chat message', { message: msg, sender: name });
    console.log(`room ${room} --- ${name}: ${msg}`);   
    });

    // stores criteria selection, which is the value chosen when people choose their search preference e.g.
    // topArtists
   socket.on('criteriaSelection', (criteria) => {
       clients[socket.id]['criteria'] = criteria;
       // console.log(clients[socket.id]['criteria']); 
   })

   // this is to let the server know that the socket is done sending data, and that it can begin to
   // look for a room that the socket can join
   socket.on('doneSendingData', (data) => {
        console.log('done sending data'); 
        joinRoom(socket, getSimilarity(socket, clients)); 
   })

   // when a socket disconnects, it sends a message to the other socket in the room that it was in that 
   // it disconnected, removes the socket from the room object, and then deletes it from the clients object
   socket.on('disconnect', () => {
    console.log('clients[socket.id]' + clients[socket.id]); 
    if (clients[socket.id] !== undefined) {
        // server emits a message to the client when a socket disconnects from the room with a timestamp
        let room = clients[socket.id]['roomNumber']; 
        let disconnectedCustomId = clients[socket.id]['userName']; 
        console.log(disconnectedCustomId + ' (socket id ' + socket.id + ') disconnected');
        // io.to(room).emit('send disconnect', disconnectedCustomId + ' has disconnected at ' + getTime())
        try {
            rooms[room - 1].removeMember(socket);
        }
        catch {
            console.log('could not remove socket member'); 
          }

        delete clients[socket.id]; 

    }
    else {
        console.log('client socket info no longer exists'); 
        // console.log(rooms)
        // console.log(clients)
    }
    });

    socket.on('changeRoomRequest', (originalRoom) => {
        // users emit change room requests when they click 'find another users'
        // they go through the joinRoom process looking for another person to chat with 
        console.log(`${clients[socket.id]['username']} made a change room request`); 
        joinRoom(socket, getSimilarity(socket, clients)); 

        // when a person does this, we have to make sure that the other client in the room
        // (if there is one) can now accept incoming connections
        if (rooms[originalRoom - 1].getNumberMembers() === 1) {
            clients[rooms[originalRoom - 1].getMembers()[0]]['awaitingConnection'] = true; 
        }
    }); 

});

// adapters keep track of when rooms are created and joined, so I am using this to 
// log to the console when rooms are created and sockets join them 
io.of("/").adapter.on('create-room', (room) => {
    console.log(`room ${room} was created`); 
}); 

io.of("/").adapter.on('join-room', (room, id) => {
    console.log(`socket ${id} has joined room ${room}`); 
}); 
/**
 * Gets the time for when a socket disconnects/connects
 * @returns String of the Hours and Minutes
 */
const getTime = () => {
    var today = new Date(); 
    return today.toLocaleTimeString('en-US', {timeZone: 'America/Phoenix'});
}


// server.listen(3333, http.get('http://login.cloud.wpcarey.asu.edu/'), 511, () => console.log('listening...')); 
httpServer.listen(process.env.PORT || 8080, () => console.log('listening on 8080')); 
