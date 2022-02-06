var clientInfo; 
const TOKEN = "https://accounts.spotify.com/api/token";
const AUTHORIZE = "https://accounts.spotify.com/authorize";
const redirect_uri = "https://anthemy.herokuapp.com/chat"; 

getCountCriteriaUsers(); 
setInterval(getCountCriteriaUsers, 5000); 

/**
 * saves criteria selection to local storage
 * displays confirm button
 * @param {*} criteria 
 */
const chooseCriteria = (criteria) => {
    localStorage.setItem('criteriaSelection', criteria);
    document.getElementById('confirm-btn').disabled = false;  
    document.getElementById('confirm-btn').style.display = 'block'; 
}

document.getElementById('confirm-btn').disabled = true; 
let buttonList = document.getElementsByClassName('criteria-btn');

// changing button style when a button is clicked on 
for (let i = 0; i < buttonList.length; i++) {
    let btn = buttonList[i]; 
    console.log(btn); 
    btn.addEventListener("click", () => {
        try {
            document.getElementsByClassName('selected-btn')[0].classList.add('criteria-btn')
            document.getElementsByClassName('selected-btn')[0].classList.remove('selected-btn')
        }
        catch {

        }
        btn.classList.remove('criteria-btn'); 
        btn.classList.add('selected-btn'); 
    });
}

/**
 * gets code from URL and starts the XMLHttpRequest process to get authorization
 */
function handleRedirect() {
    let code = getCode(); 
    fetchAccessToken(code, "https://anthemy.herokuapp.com/criteria"); 
    // fetchAccessToken(code, 'http://127.0.0.1:8080/criteria'); 
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
 * creates body of access token request and calls callAuthorizationAPI with 
 * the code and client info
 * @param {*} code comes from spotify, it is stored in the URL
 * @param {*} redirect_uri what page will load after a user accepts the app's access request
 */
async function fetchAccessToken(code, redirect_uri) {
    let body = "grant_type=authorization_code";
    clientInfo = await getKey(); 
    body += "&code=" + code; 
    body += "&client_id=" + clientInfo['client_id'];
    body += "&client_secret=" + clientInfo['client_secret']; 
    body += "&redirect_uri=" + redirect_uri;
    console.log(body)
    callAuthoriztionAPI(body, clientInfo['client_id'], clientInfo['client_secret']); 
}

/**
 * using XMLHTTP request to make a post request so we can get the actual oath and refresh token
 * @param {*} body body of XMLHttpRequest as created by fetchAccessToken()
 * @param {*} client_id client id of registered app 
 * @param {*} client_secret client secret of registered app
 */
async function callAuthoriztionAPI(body, client_id, client_secret) { 
    let postRequest = new XMLHttpRequest(); 
    postRequest.open("POST", TOKEN, true);
    postRequest.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded'); 
    
    // we have to encode the client id and secret 
    postRequest.setRequestHeader("Authorization", 'Basic ' + btoa(client_id + ":" + client_secret)); 
    postRequest.send(body); 
    postRequest.onload = handleAuthorizationResponse; 
}

/**
 * stores access token in local storage if request is successful, 
 * otherwise logs why the response failed
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
        window.location.href = 'https://anthemy.herokuapp.com/chat';    
        // window.location.href = 'http://127.0.0.1:8080/chat'; 
    }
    else {
        console.log(this.responseText); 
        window.location.href = 'https://anthemy.herokuapp.com'; 
    }
}

/**
 * gets the number of users that are connected to the chat
 */
function getCountCriteriaUsers() {
    console.log('grabbing users from db'); 
    // we defined the endpoint users in the server
    fetch('https://anthemy.herokuapp.com/users', {
        headers: {
        'Content-Type': 'application/json',
        }
    })
    .then(data => data.json())
    .then(criteriaCount => {
        console.log(criteriaCount);  
        try {
            document.getElementById('users-online-top-artists').innerHTML = criteriaCount['topArtists'] + ' user(s) online'; 
            document.getElementById('users-online-top-albums').innerHTML = criteriaCount['topAlbums'] + ' user(s) online';
            document.getElementById('users-online-top-genres').innerHTML = criteriaCount['topGenres'] + ' user(s) online';
            document.getElementById('users-online-top-songs').innerHTML = criteriaCount['topSongs'] + ' user(s) online';
            document.getElementById('users-online-random').innerHTML = criteriaCount['random'] + ' user(s) online';
        }
        catch {
            console.log(criteriaCount); 
            console.log('could not get users online'); 
        }
    })
}
