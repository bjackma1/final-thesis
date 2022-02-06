$(document).ready(function() {

    var numberItemsSelector = $("#top-number-selectId");
    var numItems = Number(numberItemsSelector.find(":selected").text());

    /**
     * populates the image and span of each category
     */
    function loadData() {
        var numItems = Number(numberItemsSelector.find(":selected").text());
        $("#top-artist-listId,#top-song-listId,#top-album-listId,#top-genres-listId").empty(); 
        for (let i=0; i < numItems; i++) {
            let appendedText = "<li class='top-li'><img class='top-img' src='/images/Spotify_Icon_RGB_White.png' width='40vh' height='40vh'><span> Item " + String(i+1) + "</span></li>"; 
            $("#top-artist-listId,#top-song-listId,#top-album-listId,#top-genres-listId").append(appendedText); 
        } 

        // if the length of the album name/song title/artist name is too long, it is displayed with a ... that can be removed by clicking on it

        data = JSON.parse(localStorage.getItem('top albums')); 
        console.log(data);
        let index = 0; 
        document.querySelectorAll('ol#top-album-listId.top-album-list>li.top-li>span').forEach((span) => {
            try {
                let localIndex = index; 
                span.innerHTML = trimString('album', data[index]['name']);
                span.addEventListener('click', () => {
                    span.innerHTML = data[localIndex]['name']; 
                })
                index ++;
            }
            catch (e) {
                console.log(e);
                span.remove();  
            }  
        });
        index = 0; 
        document.querySelectorAll('ol#top-album-listId.top-album-list>li.top-li>img').forEach((img) => {
            try {
                img.src  = data[index]['album uri']; 
                index ++;
            }
            catch {
                img.remove(); 
            }
        });

        index = 0; 
        songs = JSON.parse(localStorage.getItem('top songs'));
        document.querySelectorAll('ol#top-song-listId.top-song-list>li.top-li>span').forEach((span) => {
            try {
                let localIndex = index; 
                span.innerHTML = trimString('track', songs['items'][index]['name']);
                span.addEventListener('click', () => {
                    span.innerHTML = songs['items'][localIndex]['name']; 
                }); 
                index ++;
            }
            catch {
                span.remove();  
            } 
        });
        index = 0; 
        document.querySelectorAll('ol#top-song-listId.top-song-list>li.top-li>img').forEach((img) => {
            try {
                img.src  = songs['items'][index]['album']['images'][0]['url']; 
            }
            catch {
                console.log(songs)
            }
            index ++; 
        });

        index = 0; 
        topArtists = JSON.parse(localStorage.getItem("top artists")); 
        document.querySelectorAll('ol#top-artist-listId.top-artist-list>li.top-li>span').forEach((span) => {
            try {
                let localIndex = index; 
                span.innerHTML = trimString('artist', topArtists[index]['name']);
                span.addEventListener('click', () => {
                    span.innerHTML = topArtists[localIndex]['name']
                }); 
                console.log(topArtists[index]['name']);
                index ++;
            }
            catch {
                span.remove();  
            } 
        });
        index = 0; 
        document.querySelectorAll('ol#top-artist-listId.top-artist-list>li.top-li>img').forEach((img) => {
            try {
                img.src  = topArtists[index]['images'][0]['url']; 
            }
            catch {
                console.log('img is null'); 
            }
            index ++; 
        });
        topGenres = JSON.parse(localStorage.getItem('top genres'));
        index = 0; 
        document.querySelectorAll('ol#top-genres-listId.top-genres-list>li.top-li>span').forEach((span) => {
            try { 
                span.innerHTML = (topGenres[index]['genre']);
                span.classList.add('top-genre-li'); 
                index ++;
            }
            catch {
                let a = 1;   
            } 
        });
        index = 0; 
        document.querySelectorAll('ol#top-genres-listId.top-genres-list>li.top-li>img').forEach((img) => {
            img.remove();  
        }); 

    }

    // finding the number of top items to display and then adding the html for that amount
    for (i=0; i < numItems; i++) {
        let appendedText = `<li class='top-li'>
                                <img class='top-img' src='/images/Spotify_Icon_RGB_White.png' width='60vh' height='60vh'>
                                <span>Loading...</span>
                            </li>`
        let genreAppendedText = `<li class='top-li'>
                                    <img class='top-img' src='/images/Spotify_Icon_RGB_White.png' width='40vh' height='40vh'>
                                    <span class='top-genre-li'>Item ${String(i+1)}</span>
                                    </li>`;
        $("#top-artist-listId,#top-song-listId,#top-album-listId").append(appendedText);
        $('#top-genres-listId').append(genreAppendedText);
    }


    // automatically changing it when the select button changes
    numberItemsSelector.change(() => {
        loadData(); 
    });

    // removes the playlist
    document.getElementById("clear-button").addEventListener("click", clearPlaylist); 
}); 

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const ALBUMS = "https://api.spotify.com/v1/me/albums?limit=50";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
var SONGS = "https://api.spotify.com/v1/me/tracks?offset=0&limit=50";
var GENRES = "https://api.spotify.com/v1/artists/";
const TOP_ARTISTS = "https://api.spotify.com/v1/me/top/artists?limit=50";
const TOP_SONGS = "https://api.spotify.com/v1/me/top/tracks?limit=50";
const RECENT = "https://api.spotify.com/v1/me/player/recently-played?limit=50"; 
const CURRENT_USER = "https://api.spotify.com/v1/me";
const client_secret = 'd2b9fcf6dc0d44d29fd48e62bab6e4e5'
const client_id = '4c0788b9290a4b14ad612e1483cb4e35';
const redirect_uri = "https://anthemy.herokuapp.com/statistics";
// const redirect_uri = 'http://127.0.0.1:8080/statistics'; 

var commaSepArtists = '';
var albums = null; 
var access_token = null; 
var refresh_token = null;
var songArray = [];
var trackArray = []; 
var artistArray = [];
var genreArray = [];
var albumArray = [];
var listeningTimesArray = [];
var playlistArray = []; 
var totalPlaylistArray = []; 
var predefinedGenreList = [];

/**
 * returns either the string or the string + ... if the string is too long
 * Spotify requires that a certain amount of characters be displayed and that 
 * everything has to be viewable somehow
 * @param {*} type type of span it is, either artists, playlist, album, track
 * @param {*} sring name of the spotify data point
 * @returns 
 */
const trimString = (type, string) => {
    let allowedLength = ''; 
    switch (type) {
    case "track": 
        allowedLength = 23; 
        break; 
    case "artist": 
        allowedLength = 18;
        break; 
    case "playlist":  
    case "album":
        allowedLength = 25;
        break; 
    }

    if (string.length > allowedLength) {
        return string.slice(0, allowedLength) + '...'; 
    }
    return string; 
}

/**
 * @returns JSON with client info inside
 */
async function getClientInfo() {
    let clientInfo = await getKey(); 
    return clientInfo; 
}

const handleErrors = (response) => {
if (!response.ok) {
    alert("We encountered a connectivity problem with Spotify's Web API and are redirecting you to the home page. Please try connecting again");
    window.location.href = '/'; 
}
return response; 
}

/**
 * either handles redirect or gets auth url to sign into spotify again
 */
function onPageLoad() { 
// checking to see if we have been given a code
    if (window.location.search.length > 0) {
        handleRedirect();
        console.log('handling a redirect');
    }
    else {
        getAuthURL(); 
        console.log('getting auth url')
    }
}

/**
 * gets the key from the server endpoint that has the client secret and id
 * @returns JSON that has client id and client secret
 */
async function getKey() {
    let keyResponse = await fetch('/client-info', {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json'
        }
    });
    let key = await keyResponse.json()
    return key; 
}

/**
 * gets the authorization url to be redirected to for the user to sign in to their Spotify
 * and allow access
 */
function getAuthURL() {
    localStorage.setItem("client_id", "4c0788b9290a4b14ad612e1483cb4e35");
    localStorage.setItem("client_secret", 'd2b9fcf6dc0d44d29fd48e62bab6e4e5');
    var url = AUTHORIZE; 
    url += "?client_id=4c0788b9290a4b14ad612e1483cb4e35";
    url += "&response_type=code";
    url += "&redirect_uri=" + redirect_uri;
    url += "&show_dialog=true"; 
    url += "&scope=user-read-private user-read-email user-top-read user-read-playback-position user-library-read user-read-playback-state user-read-recently-played playlist-read-private"

    window.location.href = url;
}

/**
 * gets code from URL and starts the XMLHttpRequest process to get authorization
 */
function handleRedirect(){
    let code = getCode(); 
    fetchAccessToken(code); 
}

/**
 * parses URL to get code to return so we can get the access token
 * @returns string code from URL
 */
function getCode() { // parsing the URL  
    let code = null; 
    const querystring = window.location.search; 
    if (querystring.length > 0 ) {
        const urlParams = new URLSearchParams(querystring); // getting parameters through the URL Search Params object
        code = urlParams.get('code')
    }
    console.log(code); 
    return code
}

/**
 * creates body of access token request and calls callAuthorizationAPI with 
 * the code and client info
 * @param {*} code comes from spotify, it is stored in the URL
 * @param {*} redirect_uri what page will load after a user accepts the app's access request
 */
function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + redirect_uri;
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret; 
    console.log(body)
    callAuthoriztionAPI(body); 
}

/**
 * using XMLHTTP request to make a post request so we can get the actual oath and refresh token
 * @param {*} body body of XMLHttpRequest as created by fetchAccessToken()
 * @param {*} client_id client id of registered app 
 * @param {*} client_secret client secret of registered app
 */
function callAuthoriztionAPI(body) { // using XMLHTTP request to make a post request so we can get the actual oath and refresh token
    let postRequest = new XMLHttpRequest(); 
    postRequest.open("POST", TOKEN, true);
    postRequest.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded'); 
    postRequest.setRequestHeader("Authorization", 'Basic ' + btoa(client_id + ":" + client_secret)); 
    postRequest.send(body); 
    postRequest.onload = handleAuthorizationResponse; 
}

/**
 * stores access token in local storage if request is successful, 
 * otherwise logs why the response failed. calls all the functions to get
 * the Spotify data
 */
function handleAuthorizationResponse() {
    if (this.status == 200) { // response is good  
        var data = JSON.parse(this.responseText);
        console.log(data); 
        var data = JSON.parse(this.responseText); 
        if (data.access_token != undefined) {
            access_token = data.access_token; 
            console.log(access_token);
            localStorage.setItem("access_token", access_token);
        }
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            console.log(refresh_token) 
            localStorage.setItem("refresh_token", refresh_token);
        } 
    }
    else {
        console.log(this.responseText); 
    }
    getTopAlbums();
    getTopSongs();
    getPlaylists();  
    getTopArtistsAndGenres();
    getRecentlyPlayed(); 
    selectPlaylist(); 
}

/**
 * easier way to not have to await for fetch every time
 * @param {*} method get or post 
 * @param {*} url endpoint that will be fetched
 * @returns 
 */
async function callAPI(method, url) {

    const response = await fetch(url, {
        method: method,
        headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer ' + localStorage.getItem("access_token")
        }
    });

    const body = await response.json(); 

    return body; 
}

/**
 * fetches songs and then fills the innerHTML of the span elements they relate to
 * @param {*} endpoint top songs endpoint
 */
async function getTopSongs(endpoint = TOP_SONGS) {
    fetch(endpoint, {
        headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer ' + localStorage.getItem("access_token")
        }
    })
    .then(data => data.json())
    .then(data => {
        let index = 0; 
        document.querySelectorAll('ol#top-song-listId.top-song-list>li.top-li>span').forEach((span) => {
            try {
                span.innerHTML = trimString('track', (data['items'][index]['name']));
                // console.log(response['items'][index]['name']);
                index ++;
            }
            catch {
                span.remove();  
            } 
        });
        index = 0; 
        document.querySelectorAll('ol#top-song-listId.top-song-list>li.top-li>img').forEach((img) => {
            try {
                img.src  = data['items'][index]['album']['images'][2]['url']; 
                index ++;
            }
            catch {
                img.remove(); 
            } 
        });
        localStorage.setItem("top songs", JSON.stringify(data));
    }); 
    }


/**
 * gets the top artists, and then from that the top genres
 * @param {*} endpoint spotify top artist endpoint
 */
async function getTopArtistsAndGenres(endpoint = TOP_ARTISTS) {
    fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    .then(data => data.json())
    .then(data => {
    // getting top artists now
        let index = 0; 
        document.querySelectorAll('ol#top-artist-listId.top-artist-list>li.top-li>span').forEach((span) => {
            try {
                span.innerHTML = trimString('artist', data['items'][index]['name']);
                index ++;
            }
            catch (e) {
                console.log(e)
                span.remove();  
            } 
        });
        localStorage.setItem('top artists', JSON.stringify(data['items'])); 
        // getting top genres now
        index = 0; 
        document.querySelectorAll('ol#top-artist-listId.top-artist-list>li.top-li>img').forEach((img) => {
            img.src  = data['items'][index]['images'][2]['url']; 
            index ++; 
        });
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
        localStorage.setItem('top genres', JSON.stringify(sortedGenreCount));
    
        index = 0; 
        document.querySelectorAll('ol#top-genres-listId.top-genres-list>li.top-li>span').forEach((span) => {
            try {
                span.innerHTML = sortedGenreCount[index]['genre'];
                index ++;
            }
            catch {
                let a = 1;   
            } 
        });
        index = 0; 
        document.querySelectorAll('ol#top-genres-listId.top-genres-list>li.top-li>img').forEach((img) => {
            img.remove();  
        }); 

    });  
}

/**
 * gets all of a user's songs and then finds out which albums have the highest number
 * of liked songs
 * @param {*} endpoint 
 */
async function getTopAlbums() {
    let songTotalRequest = await fetch("https://api.spotify.com/v1/me/tracks?offset=0&limit=1", {
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                }
            });
    // getting the number of liked songs so we know how iterate through everything
    songTotalRequest = await songTotalRequest.json();
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
    
    // flattening out the song chunks array to just get the invididual tracks themselves
    songChunks.forEach(chunk => {
        try {
            chunk['items'].forEach(song => {
            flatTrackArray.push(song['track']); 
        });    
        }
        catch {
            console.log('error in song chunk');  
        } 
    });
    let albumArray = []; 
    // if the track is an album, push the album and a link to its cover to the array
    flatTrackArray.forEach((track) => {
        if (track['album']['album_type'] === 'album') {
            albumArray.push([track['album']['name'], track['album']['images'][2]['url']]);
        }
    }); 
    let uniqueAlbums = new Set(albumArray.map(JSON.stringify));
    
    // get a list of the unique albums as strings and then map that back into JSONS so we can 
    // create another object that has the album and then the number of occurences
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
    localStorage.setItem('top albums', JSON.stringify(sortedAlbumCount)); 
    let index = 0; 
    document.querySelectorAll('ol#top-album-listId.top-album-list>li.top-li>span').forEach((span) => {
        try {
            span.innerHTML = trimString('album', sortedAlbumCount[index]['name']);
            index ++;
        }
        catch {
            console.log('error in getAllSongs() span')
        } 
    });
    index = 0; 
    document.querySelectorAll('ol#top-album-listId.top-album-list>li.top-li>img').forEach((img) => {
        try {
            img.src  = sortedAlbumCount[index]['album uri']; 
            index ++;
        }
        catch {
            console.log('error in getAllSongs() img')  
        } 
    }); 
}

/**
 * gets 50 most recently played songs and stores them ased on the hour of the day
 * @param {*} endpoint recently played endpoint
 */
async function getRecentlyPlayed(endpoint = RECENT) {
    fetch(endpoint, {
        headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer ' + localStorage.getItem("access_token")
        }
    })
    
    .then(data => data.json())
    .then(data => {
        // finds the hour of the day that the song was played at
        data['items'].forEach((track) => {
            listeningTimesArray.push(new Date(track['played_at']).getHours()); 
        });
        
        // sorts in terms of high to low
        listeningTimesArray = listeningTimesArray.sort((a, b) => {a-b});
        var listeningList = []
        for (let j = 0; j < 24; j++) {
            listeningList.push({'x': j, 'y':0})
        }

        //incrementing listening list JSONS
        for (let k = 0; k < listeningList.length; k++) {
            for (let l = 0; l < listeningTimesArray.length; l++) {
                if (listeningList[k]['x'] === listeningTimesArray[l]) {
                    listeningList[k]['y'] += 1; 
                }
            }
        }
        
        makeGraph(listeningList);

    }); 
}

/**
 * makes a graph out of the listening data using JSchart
 * @param {Object} data 
 */
function makeGraph(data) {
    const chartCanvas  = document.getElementById('chartCanvasId')
    const chartContext = chartCanvas.getContext('2d')

    // listening time chart
    var myChart = new Chart(chartContext, {
        type: 'line',
        data: {
            labels: ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", 
                    "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"],
            datasets: [{
                label: undefined,
                data: data,
                borderWidth: 2,
                borderColor: "white"
            }]
        },
        options: {
            title: {
                display: true,
                text: "",  
                color: "rgb(255, 255, 255)",
                font: {
                    weight: "bold", 
                    size: 200
                },
            },
            elements: {
                point: {
                    radius: 0
                }
            }, 
            responsive: true,           // chartjs RWD requirement
            maintainAspectRatio: false,  // chartjs RWD requirement
            legend: {
                display: false
            }
        }
    });
}

/**
 * gets rid of the large playlist image and expanded playlist upon clicking
 */
function clearPlaylist() {
    $(".expanded-playlist").remove();
    $("#selected-playlist-name").html("Click Playlist");
    document.getElementById('large-display-playlist').src = '/images/Spotify_Icon_RGB_White.png';
}

/**
 * gets a users current liked playlists, both private and public
 */
async function getPlaylists() {
    fetch(CURRENT_USER, {
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    }) 
    
    .then(data => data.json())
    .then(data => {
        // we are getting a max of 50 playlists
        fetch(`https://api.spotify.com/v1/users/${data['id']}/playlists?offset=0&limit=50`, {
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        
        .then(res => res.json())
        .then(res => {
            let appendedHTML = ''; 
            console.log(res['items'].length); 
            // adding a table element for the table of playlist images for each image
            for (let i = 1; i < res['items'].length + 1; i++) {
                appendedHTML += `<td id='${i}' class='playlist-icon'>
                <img class='playlist-img' src='/images/Spotify_Icon_RGB_White.png' title=''</td>`; 
                // there will be up to 6 images in a row, so on the 6th one we enclose all of the 
                // table cell html in a table row html
                if (i % 6 === 0) {
                    appendedHTML = `<tr class='playlist-breakdown-row'>` + appendedHTML + '</tr>'
                    document.getElementById('playlist-breakdown-tbody').insertAdjacentHTML('beforeend', appendedHTML);
                    appendedHTML = ''; 
                }
            }
            // we also have to add the tr at the end of the loop in the case that the user doesn't have 
            // a number of playlists that is a multiple of 6
            if (appendedHTML !== '') {
                appendedHTML = `<tr class='playlist-breakdown-row'>` + appendedHTML + '</tr>'
                document.getElementById('playlist-breakdown-tbody').insertAdjacentHTML('beforeend', appendedHTML);
            }
            
            // adding image names and sources to the placeholders loaded in automatically
            let index = 0;
            document.querySelectorAll('img.playlist-img').forEach((img) => {
                img.title = res['items'][index]['name'];
                try {
                    img.src  = res['items'][index]['images'][0]['url']; 
                }
                catch {
                    console.log(res['items'][index]); 
                    console.log(res['items']); 
                    // img.src  = res['items'][index]['images'][0]['url']; 
                }
                index ++; 
            });
            
            localStorage.setItem('playlists', JSON.stringify(res));
            localStorage.setItem('playlist array', res['items']);  
            var promiseArray = [];
            // pushing promises to get playlist info to an array so they can all be resolved
            // at the same time faster

            // a link to get all of the tracks is stored in the initial response to the 
            // user's playlists endpoint 
            res['items'].forEach(playlist => {
                promiseArray.push(callAPI("GET", playlist['tracks']['href'])); 
            });
            
            Promise.all(promiseArray)
                .then((values) => {
                    // totalPlaylistArray is an array that contains all of the playlist 
                    // information and tracks
                    totalPlaylistArray = values;
                    for (let i = 0; i < totalPlaylistArray.length; i ++) {
                        // fetching up to 200 songs from every playlist
                        if (totalPlaylistArray[i]['next'] !== null) { 
                            fetch(totalPlaylistArray[i]['next'], {
                                headers: {
                                    'Content-Type': 'application/json', 
                                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                                }
                            })
                            
                            .then(tracks => tracks.json())
                            .then(trackJSON => {
                                for (let track of trackJSON['items']) { 
                                    // pushing everything to tracks so it can be used 
                                    // in the selectPlaylist() function
                                    totalPlaylistArray[i]['items'].push(track);
                                } 
                            }); 
                        }
                    } 
                    selectPlaylist(); 
                });
        });  
    });  

}


function selectPlaylist() {
    // getting and array of all the playlists
    const playlists = [... document.getElementsByClassName('playlist-icon')]; 
    playlists.forEach(playlist => {
        playlist.addEventListener('click', () => {
            // clicking on an image of a playlist will cause a div to load in that has 
            // more detailed info on the playlist
            document.getElementById('selected-playlist').classList.add('open-playlist'); 
            $(".expanded-playlist").remove(); 
            let appendedText = 
            `<ul class='expanded-playlist'>
                <h5 class='expanded-playlist' id="top-album-expanded-playlist">Top Albums</h4>
                <li class='expanded-playlist-item' id="top-album1"></li>
                <li class='expanded-playlist-item' id="top-album2"></li>
                <li class='expanded-playlist-item' id="top-album3"></li>
            </ul>
            <ul class='expanded-playlist'>
                <h5 class='expanded-playlist'>Top Genres</h4>
                <li class='expanded-playlist-item' id="top-genre1"></li>
                <li class='expanded-playlist-item' id="top-genre2"></li>
                <li class='expanded-playlist-item' id="top-genre3"></li>
            </ul>
            <ul class='expanded-playlist'>
                <h5 class='expanded-playlist'>Top Artists</h4>
                <li class='expanded-playlist-item' id="top-artist1"</li>
                <li class='expanded-playlist-item' id="top-artist2"</li>
                <li class='expanded-playlist-item' id="top-artist3"</li>
            </ul>`; 
            document.getElementById('expanded-playlist-div').insertAdjacentHTML('afterbegin', appendedText);  
            document.getElementById('selected-playlist-name').innerHTML = trimString('playlist', playlist.children[0].title);
            
            // error handling if there is an error getting the playlist's image from spotify
            if (playlist.children[0].src === undefined) {
                document.getElementById('large-display-playlist').src = '/images/Spotify_Icon_RGB_White.png'; 
            }
            else {
                document.getElementById('large-display-playlist').src = playlist.children[0].src; 
            }
            
            // these actaully get the playlist information
            getTopPlaylistAlbums(totalPlaylistArray[Number(playlist.id) - 1]);
            getTopPlaylistArtists(totalPlaylistArray[Number(playlist.id) - 1]);
            getTopPlaylistGenres(totalPlaylistArray[Number(playlist.id) - 1]);
        }); 
    }); 
}

/**
 * gets the top albums from the playlist using the similar logic from before
 * @param {Object} playlist 
 */
function getTopPlaylistAlbums(playlist) {
    let albumArray = []; 
    for (let i = 0; i < playlist['items'].length; i++) {
        // this could be null sometimes
        try {
            albumArray.push(playlist['items'][i]['track']['album']['name']);    
        }
        catch {
            console.log(playlist); 
        }
    }
    var albumSet = new Set(albumArray); 
    var albumCount = {};
    for (i = 0; i < albumArray.length; i++) {
        albumCount[albumArray[i]] = {'count': 0, 'genre': albumArray[i]}; 
    }
    albumSet.forEach(genre => {
        for (let i = 0; i < albumArray.length; i ++) {
            if (albumArray[i] === genre) {
                albumCount[genre]['count'] += 1; 
            }
        }
    });  
    var sortedAlbumCount = Object.values(albumCount).sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
    try {
        document.getElementById("top-album1").innerHTML = trimString('album', sortedAlbumCount[0]['genre']);
        document.getElementById("top-album2").innerHTML = trimString('album', sortedAlbumCount[1]['genre']);
        document.getElementById("top-album3").innerHTML = trimString('album', sortedAlbumCount[2]['genre']); 
    }
    catch {
        console.log('not enough albums')
        removeUnusedTopItems()
    }

}

/**
 * gets the top playlist artists from the tracks in a playlist
 * using the same logic defined above
 * @param {Object} playlist 
 */
function getTopPlaylistArtists(playlist) {
    let artistArray = [];
    for (let i = 0; i < playlist['items'].length; i++) {
        if (playlist['items'][i]['is_local'] !== true) {
            try {
                artistArray.push(playlist['items'][i]['track']['album']['artists'][0]['name']);     
            }
            // artistArray.push(playlist['items'][i]['track']['album']['artists'][0]['name']); 
            catch {
                console.log(playlist); 
            }
        } 
    }
    var artistSet = new Set(artistArray); 
    var artistCount = {};
    for (i = 0; i < artistArray.length; i++) {
        artistCount[artistArray[i]] = {'count': 0, 'genre': artistArray[i]}; 
    }
    artistSet.forEach(genre => {
        for (let i = 0; i < artistArray.length; i ++) {
            if (artistArray[i] === genre) {
                artistCount[genre]['count'] += 1; 
            }
        }
    });  
    var sortedArtistCount = Object.values(artistCount).sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
    try {
        document.getElementById("top-artist1").innerHTML = trimString('artist', sortedArtistCount[0]['genre']);
        document.getElementById("top-artist2").innerHTML = trimString('artist', sortedArtistCount[1]['genre']);
        document.getElementById("top-artist3").innerHTML = trimString('artist', sortedArtistCount[2]['genre']);
    }
    catch {
        console.log('not enough artists');
        removeUnusedTopItems()
    }
}

/**
 * takes in all the songs in a playlist
 * figures out which artists already have their genre data saved locally
 * for the ones that aren't saved locally, make a new request(s) to Spotify to get
 * their artist data and then go through and find top genres from the flat list
 * of tracks like was done before
 */
async function getTopPlaylistGenres(playlist) {
    let artists = JSON.parse(localStorage.getItem('top artists'));
    predefinedGenreList = []; 
    let neededArtists = [];  
    let artistInPlaylist = false; 
    let k = 0; 
    for (let i = 0; i < playlist['items'].length; i++) {
        k = 0; 
        // checking locally saved top artists for their data to avoid making an unnecessary request
        artistInPlaylist = false; 
        while (!artistInPlaylist && k < artists.length) {
            try {
                artistInPlaylist = (artists[k]['name'] === playlist['items'][i]['track']['artists'][0]['name']);
            }
            catch {
                artistInPlaylist = true; 
            }
            k++;
        }
        // if we don't have the artist's data saved, we add it to an array that stores
        // needed artists
        if (!artistInPlaylist) {
            neededArtists.push(playlist['items'][i]['track']['artists'][0]['id']);
        }
        else {
            predefinedGenreList.push(artists[k-1]['genres']);
        }
    }

    // spotify lets you make a request with a bunch of different ids if you supply the 
    // ids parameter with a comma separated list of ids, so we make an array and then
    // flatten it out into a string that is added to the request 
    
    // again, only up to 50 are possible so we may have to make multiple requests
    console.log(neededArtists); 
    let concatIdString = ""; 
    let concatArray = []; 
    let newGenresArray = []; 
    for (let l = 0; l < Math.floor(neededArtists.length / 50) + 1; l++) {
        concatIdString = ''; 
        for (let m = 0; m < 50; m ++) {
            if (m + (l * 50) < neededArtists.length - 1) {
                if (m !== 49 && neededArtists.legnth !== 1) {
                    concatIdString += neededArtists[m + (l * 50)] + ","; 
                }
                else {
                    concatIdString += neededArtists[m]; 
                }
            }
            else {
                if (neededArtists.length === 1) {
                    concatIdString = neededArtists[0] + ','; 
                }
                break; 
            }
        }
        concatArray.push(concatIdString.slice(0, -1));
    }
    console.log(concatArray); 
    if (concatArray[0] === '') {
        convertGenreResponse(predefinedGenreList); 
    }
    else {
        if (concatArray.length === 1 && concatArray[0] !== '') {
            // changed i to 0
            let concatResponse = await fetch("https://api.spotify.com/v1/artists?ids="+concatArray[0], {
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                }
            }); 

            let values = await concatResponse.json()
            console.log(values); 
                for (let k = 0; k < values['artists'].length; k++) {
                    try {
                        if (values['artists'][k]['genres'] !== []) {
                            // adding the new genres to the previously defined genre list
                            predefinedGenreList.push(values['artists'][k]['genres']); 
                        }  
                    }
                    catch {
                        continue; 
                    }
                }
            
            
            // .then(values => {
            //     // this is the JSON data for all of the artists that we just requested
            //     console.log(values); 
            //     for (let i = 0; i < values.length; i ++) {
            //         for (let k = 0; k < values[i]['artists'].length; k++) {
            //             try {
            //                 if (values[i]['artists'][k]['genres'] !== []) {
            //                     // adding the new genres to the previously defined genre list
            //                     predefinedGenreList.push(values[i]['artists'][k]['genres']); 
            //                 }  
            //             }
            //             catch {
            //                 continue; 
            //             }
            //         }
            //     }
            // });
        }
        if (!concatArray.length === 1 || predefinedGenreList.length === 0) {
            // if the concatArray length is greater than 1, we have to do a loop, so we push 
            // the returned fetch promises to a new array and use Promise.all() again 
            // to resolve all the promises and parse the results
            for (let i = 0; i < concatArray.length; i++) {
                newGenresArray.push(fetch("https://api.spotify.com/v1/artists?ids="+concatArray[i], {
                    headers: {
                        'Content-Type': 'application/json', 
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                })
                );
            }
            console.log(newGenresArray); 
            Promise.all(newGenresArray)
                .then(values => convertGenreResponse(values))
        }
        if (concatArray.length > 1) {
            concatArray.forEach(concatArtists => {
                newGenresArray.push(fetch("https://api.spotify.com/v1/artists?ids="+concatArtists, {
                    headers: {
                        'Content-Type': 'application/json', 
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                })
                );
            });
            console.log(newGenresArray); 
            Promise.all(newGenresArray)
                .then(values => convertGenreResponse(values)); 
        }
        console.log(predefinedGenreList); 
        sortGenres(predefinedGenreList); 
    }
}

/**
 * converts all the promises to jsons and then adds the genres to the 
 * predefind genres list
 * @param {Promise} values 
 */
function convertGenreResponse(values) {
    predefinedGenreList = []; 
    for (let i = 0; i < values.length; i ++) {
        try {
            values[i].json().then(value => {
                console.log(value);
                for (let k = 0; k < value['artists'].length; k++) { 
                    try {   
                        predefinedGenreList.push(value['artists'][k]['genres']);    
                    }
                    catch (e) {
                        if (!e instanceof TypeError) {
                            console.log(e);
                        }
                    }
                }
            });  
        }
        catch {
            predefinedGenreList.push(values[i]); 
        }
            console.log(predefinedGenreList); 
            sortGenres(predefinedGenreList); 
    }
}; 

/**
 * sorts the flat genres list by the number of occurences
 * @param {Array} predefinedGenreList 
 */
function sortGenres(predefinedGenreList) {
    let flatGenreList = []; 
    for (item of predefinedGenreList) {
        for (genre of item) {
            flatGenreList.push(genre);
        }
    }

    // initializing a new object that has the genre name as the key and 
    // the number of occurrences as the value
    console.log(flatGenreList);
    var genreSet = new Set(flatGenreList); 
    var genreCount = {};
    for (i = 0; i < flatGenreList.length; i++) {
        genreCount[flatGenreList[i]] = {'count': 0, 'genre': flatGenreList[i]}; 
    }
    genreSet.forEach(genre => {
        for (let i = 0; i < flatGenreList.length; i ++) {
            if (flatGenreList[i] === genre) {
                genreCount[genre]['count'] += 1; 
            }
        }
    }); 

    var sortedGenreCount = Object.values(genreCount).sort((a, b) => parseFloat(b.count) - parseFloat(a.count));
    try {
        document.getElementById("top-genre1").innerHTML = sortedGenreCount[0]['genre'];
        document.getElementById("top-genre2").innerHTML = sortedGenreCount[1]['genre'];
        document.getElementById("top-genre3").innerHTML = sortedGenreCount[2]['genre'];
    }
    catch {
        console.log('not enough genres'); 
        // sometimes, there aren't enough top genres, but we want to get rid of the placeholders
        removeUnusedTopItems()
    }
}

/**
 * removes placholder expaned playlist values
 */
function removeUnusedTopItems() {
    let expandedLi = [... document.getElementsByClassName('expanded-playlist-item')]; 
    let unwantedValueSet = new Set();
    ['Artist 1', 'Artist 2', 'Artist 3', 'Album 1', 'Album 2', 'Album 3', 'Genre 1', 'Genre 2', 'Genre 3'].forEach(id => unwantedValueSet.add(id)); 
    expandedLi.forEach(li => {
        if (unwantedValueSet.has(li.innerHTML)) {
            li.innerHTML = ''; 
        }
    });
}