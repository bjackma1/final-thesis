"use strict"; 
// endpoiints 
const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const ALBUMS = "https://api.spotify.com/v1/me/albums?limit=50";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
var SONGS = "https://api.spotify.com/v1/me/tracks?limit=50";
const TOP_ARTISTS = "https://api.spotify.com/v1/me/top/artists?limit=50";
const TOP_SONGS = "https://api.spotify.com/v1/me/top/tracks?limit=50";
const RECENT = "https://api.spotify.com/v1/me/player/recently-played?limit=50";
const CURRENT_USER = "https://api.spotify.com/v1/me"; 


// declaring variables
var redirect_uri = "https://anthemy.herokuapp.com/chat"
var access_token = null; 
var refresh_token = null;
var albums = null;  
var type = null; 
var songs = null; 
var topArtists = null; 
var topSongs = null; 
var playlists = null; 
var recentlyPlayed = null; 

var songArray = []; 
var albumArray = []; 
var playlistArray = []; 
var trackArray = []; 
var artistArray = []; 

sessionStorage.clear(); 
var url = new URL(window.location.href)
var username = localStorage.getItem('user display name'); 
var room = null; 
var socket = io('https://anthemy.herokuapp.com'); 
var form = document.getElementById('form'); 
var input = document.getElementById('input');
var head = document.getElementById('header');  
var allClients = [];
var username = ''; 

// waits for send room event from server and then logs that the 
// user joined a certain room 
socket.on('send room', data => { 
    room = data[0];
    console.log(username + " joined " + data[0]); 
});

// client receives information about the clients in a room
socket.on('sendClientInfo', (clients) => {
    allClients = clients; 
    localStorage.setItem("roomNumber", clients[0]['roomNumber']);
    displayUserInfo(1, clients[0]);
    
    // if room is full, enable find new person button and display
    // both user's info

    //if not, clear everything from the second user's info table
    if (clients.length == 2) {
        document.getElementById('find-new-person').disabled = false; 
        displayUserInfo(2, clients[1]);
    } 
    else {
        document.getElementById('find-new-person').disabled = false; 
        document.getElementById("user2-top-artist").innerHTML = ''; 
        document.getElementById("user2-top-genre").innerHTML = ''; 
        document.getElementById("user2-top-album").innerHTML = ''; 
        document.getElementById("user2-top-song").innerHTML = ''; 
        document.getElementById('user2-name').innerHTML = 'waiting for someone else';
        
    }
}); 

/**
 * renders values sent from server onto the screen of both clients. in some edge cases not every user
 * has 3 of any of the categories, so we have to use a lot of error handling
 * @param {*} userNumber index of user in clients array
 * @param {*} userInfo client info from the server received in sendClientInfo event
 */
function displayUserInfo(userNumber, userInfo) {
    try {
        document.getElementById('user' + userNumber +'-name').innerHTML = userInfo.userName; 
    }
    catch {
        console.log('could not display name'); 
    }
    try {
        document.getElementById('user' + userNumber +'-top-genre').innerHTML = userInfo.topGenres[0]['genre']
        document.getElementById('user' + userNumber +'-top-genre').innerHTML += ", " + userInfo.topGenres[1]['genre'] 
        document.getElementById('user' + userNumber +'-top-genre').innerHTML += ", " + userInfo.topGenres[2]['genre'];
    }
    catch (e) {
        console.log('could not display genres');
        console.log(e)
    }
    try {
        document.getElementById('user' + userNumber +'-top-artist').innerHTML = userInfo.topArtists[0]['name'];
        document.getElementById('user' + userNumber +'-top-artist').innerHTML += ", " + userInfo.topArtists[1]['name'];
        document.getElementById('user' + userNumber +'-top-artist').innerHTML += ", " +userInfo.topArtists[2]['name']; 
    }
    catch (e) {
        console.log('could not display artists');
        console.log(e)
    }
    try {
        document.getElementById('user' + userNumber +'-top-song').innerHTML = userInfo.topSongs[0]['name'] + ": " + userInfo.topSongs[0]['album']['artists'][0]['name'] + '<br>'
        document.getElementById('user' + userNumber +'-top-song').innerHTML += userInfo.topSongs[1]['name'] + ": " +userInfo.topSongs[1]['album']['artists'][0]['name'] + '<br>'
        document.getElementById('user' + userNumber +'-top-song').innerHTML += userInfo.topSongs[2]['album']['artists'][0]['name'] + ": " + userInfo.topSongs[2]['name'];
    }
    catch (e) {
        console.log('could not display songs'); 
        console.log(e);
    }
    try {
        document.getElementById('user' + userNumber +'-top-album').innerHTML = userInfo.topAlbums[0]['name'] 
        document.getElementById('user' + userNumber +'-top-album').innerHTML += ", " +userInfo.topAlbums[1]['name'] 
        document.getElementById('user' + userNumber +'-top-album').innerHTML += ", " + userInfo.topAlbums[2]['name'];
    }
    catch (e) {
        console.log('could not display albums'); 
        console.log(e)
    }
}

/** emits a changeRoomRequest event and sends the room that it is coming from */
function changeRoom() {
    socket.emit('changeRoomRequest', localStorage.getItem('roomNumber')); 
}

// when the form is submitted, it events a chat message event that contains the
// sender, chat cotent, and room that it is coming from
form.addEventListener('submit', e => {
    e.preventDefault(); 
    if (input.value) {
        socket.emit('chat message', input.value, room, username);
        input.value = ''; 
    }
});

// when a socket receives a chat message event, it parses the JSON it receives
// and creates a div in the chat box to display it and color it based on the 
// user tha sent it 
socket.on('chat message', msg => {
    let messageDiv = document.createElement('div'); 
    let message = document.createElement('span');
    let sender = document.createElement('span');
    sender.className = 'message-sender'
    messageDiv.className = 'message-container';
    if (allClients[0]['userName'] !== msg.sender) {
        sender.className += ' user2';
    }
    else {
        sender.className += ' user1'; 
    }
    sender.textContent = msg.sender + ': '; 
    message.textContent = msg.message; 
    messageDiv.appendChild(sender); 
    messageDiv.appendChild(message); 
    document.getElementById('chat-display-box').appendChild(messageDiv);
    // window.scrollTo(0, document.body.scrollHeight);
    let chatDisplayBox = document.getElementById('chat-display-box');
    chatDisplayBox.scrollTop = chatDisplayBox.scrollHeight;   
}); 

// creates a message that displays when a client leaves a room 
socket.on('send disconnect', disconnectMessage => {
    var name = document.createElement('p');
    name.textContent = disconnectMessage; 
    document.getElementById('chat-display-box').appendChild(name);
    window.scrollTo(0, document.body.scrollHeight);
}); 

// if the server stops, try and reconnect again
socket.on("disconnect", (reason) => {
    if (reason === 'io server disconnect') {
        socket.connect(); 
    }
}); 


// starts the chain of functions to get all user data
const onPageLoad = () => {
    newGetTopSongs(); 
}

// API CALL SECTION

/**
 * gets top songs from Spotify's TOP SONGS endpont
 * @param {*} endpoint TOP SONGS endpoint
 */
async function newGetTopSongs(endpoint = TOP_SONGS) {
    fetch(endpoint, {
        headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer ' + localStorage.getItem("access_token")
        }
    })
    
    .then(data => data.json())
    .then(data => {
        // saves user criteria to the server
        socket.emit('criteriaSelection', localStorage.getItem('criteriaSelection'));
        // saves user's top songs to the server
        socket.emit('storeTopSongs', data['items']);
        
        // calling the functions one after another makes everything more streamlined and reliable
        newGetTopArtistsAndGenres(); 
    }); 
}

/**
 * gets the top artists, and then from that the top genres and then get's a user's profile
 * @param {*} endpoint spotify top artist endpoint
 */
async function newGetTopArtistsAndGenres(endpoint = TOP_ARTISTS) {
    fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    
    .then(data => data.json())
    // getting top artists
    .then(data => {
        console.log(data); 
        socket.emit('storeTopArtists', data['items']); 
    // getting top genres now
    // artists are where the genre data is defined, so we get all the genres of 
    // artists and find the count of the number of genres that occur and then sort them

        let genreList = []; 
        for (let i = 0; i < data['items'].length; i++ ) {
            for (let k = 0; k < data['items'][i]['genres'].length; k++) {
                genreList.push(data['items'][i]['genres'][k]); 
            }
        }
        let genreSet = new Set(genreList); 
        let genreCount = {}
        // initializing genre count object
        for (let i = 0; i < genreList.length; i++) {
            genreCount[genreList[i]] = {'count': 0, 'genre': genreList[i]}; 
        }
        // incrementing count of each genre
        genreSet.forEach(genre => {
            for (let i = 0; i < genreList.length; i ++) {
                if (genreList[i] === genre) {
                    genreCount[genre]['count'] += 1; 
                }
            }
        });
        let sortedGenreCount = Object.values(genreCount).sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
        socket.emit('storeTopGenres', sortedGenreCount);
        newGetCurrentUserProfile(); 
    });  
}

/**
 * gets user's profile and then gets top albums
 * @param {*} endpoint 
 */
async function newGetCurrentUserProfile(endpoint = CURRENT_USER) {
    fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
        
    .then(data => data.json())
    .then(data => {
        // saves data to server and saves display name as username
        socket.emit('storeUserName', data['display_name']);
        username = data['display_name']; 
        newGetTopAlbums(); 
    }); 
}

/**
 * gets all of a user's songs and then finds out which albums have the highest number
 * of liked songs
 * @param {*} endpoint 
 */
async function newGetTopAlbums(endpoint = SONGS) {
    // top albums for a user
    // finding number of songs so we know how to iterate through everything
    let songTotalRequest = await fetch("https://api.spotify.com/v1/me/tracks?offset=0&limit=1", {
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    songTotalRequest = await songTotalRequest.json()
    let songTotal = songTotalRequest['total']; 
    console.log(`song total ${songTotal}`); 
    
    // since we can only increment in terms of 50, we have to make a lot of requests depending 
    // on how many liked songs a user has 
    let songChunks = []; 
    for (let i=0; i <= songTotal; i += 50) {
        try {
            let songFetch = await fetch("https://api.spotify.com/v1/me/tracks?offset="+i+"&limit=50", {
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        }); 
        songChunks.push(await songFetch.json()); 
        console.log('fetching song data with an offset of ' + i); 
        }
        catch (e) {
            console.log('get failed')
            console.log(e); 
        }
    }
    console.log(songChunks); 
    // done getting top songs
    // time to get top albums from the array of top songs
    let flatTrackArray = []; 
    
    // flattening out the song chunks array to just get the individual tracks themselves
    songChunks.forEach(chunk => {
        try {
            chunk['items'].forEach(song => {
                flatTrackArray.push(song['track']); 
        });    
        }
        catch {
            console.log('flattening song chunks did not work'); 
        } 
    }); 

    console.log(flatTrackArray); 
    let albumArray = []; 
    // if the track is an album, push the album and a link to its cover to the array
    flatTrackArray.forEach((track) => {
        if (track['album']['album_type'] === 'album') {
            try {
                albumArray.push([track['album']['name'], track['album']['images'][2]['url']]);
            }
            catch {
                console.log('could not add to album array'); 
            }
        }
    }); 
    
    // get a list of the unique albums as strings and then map that back into JSONS so we can 
    // create another object that has the album and then the number of occurences
    let uniqueAlbums = new Set(albumArray.map(JSON.stringify));
    uniqueAlbums = Array.from(uniqueAlbums).map(JSON.parse)
    let albumCount = {};
    
    // initializing the album count and then incrementing the values with how many times that album occurs
    for (let i = 0; i < uniqueAlbums.length; i++) {
        albumCount[uniqueAlbums[i][0]] = {'count': 0, 'album uri': uniqueAlbums[i][1], 'name': uniqueAlbums[i][0]}; 
    }
    albumArray.forEach((album) => {
        albumCount[album[0]]['count'] += 1
    });
    
    // sorting the value
    let sortedAlbumCount = Object.values(albumCount).sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
    sortedAlbumCount = sortedAlbumCount.slice(0, 50);
    localStorage.setItem("sortedAlbumCount", sortedAlbumCount); 
    socket.emit('storeTopAlbums', sortedAlbumCount);
    socket.emit('doneSendingData', []);  
    console.log('requested client info'); 
    
    
    // while all of this data is loading, there is a loading screen that is being shown, so when this is all done
    // that popup goes away
    let waitingForData = document.getElementById("waiting"); 
    waitingForData.style.display = 'none'; 
    let blankScreen = document.getElementById('blank-screen-waiting'); 
    blankScreen.style.display = 'none'; 
}