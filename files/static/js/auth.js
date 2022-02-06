import { getAllData } from "./statistics";
export var clientInfo; 
export const TOKEN = "https://accounts.spotify.com/api/token";
export const AUTHORIZE = "https://accounts.spotify.com/authorize";

export function handleRedirect(redirect_uri) {
    let code = getCode(); 
    fetchAccessToken(code, redirect_uri); 
}

export function getCode() { // parsing the URL  
    let code = null; 
    const querystring = window.location.search; 
    if (querystring.length > 0 ) {
        const urlParams = new URLSearchParams(querystring); // getting parameters through the URL Search Params object
        code = urlParams.get('code')
    }
    console.log(code); 
    return code
}

export async function getKey() {
    let keyResponse = await fetch('/client-info', {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json'
        }
    });
    let key = await keyResponse.json()
    return key; 
}

export async function fetchAccessToken(code, redirect_uri) {
    let body = "grant_type=authorization_code";
    clientInfo = await getKey(); 
    body += "&code=" + code; 
    body += "&client_id=" + clientInfo['client_id'];
    body += "&client_secret=" + clientInfo['client_secret']; 
    body += "&redirect_uri=" + redirect_uri;
    console.log(body)
    callAuthoriztionAPI(body, clientInfo['client_id'], clientInfo['client_secret']); 
}

export async function callAuthoriztionAPI(body, client_id, client_secret) { // using XMLHTTP request to make a post request so we can get the actual oath and refresh token
    let postRequest = new XMLHttpRequest(); 
    postRequest.open("POST", TOKEN, true);
    postRequest.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded'); 
    postRequest.setRequestHeader("Authorization", 'Basic ' + btoa(client_id + ":" + client_secret)); 
    postRequest.send(body); 
    postRequest.onload = handleAuthorizationResponse; 
}

export function handleAuthorizationResponse() {
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
        if (window.location.href = "https:spotimatch.herokuapp.com/criteria") {
            window.location.href = 'https://spotimatch.herokuapp.com/chat';    
        }
        else {
            getAllData(); 
        }
    }
    else {
        console.log(this.responseText); 
        console.log(this)
    }
}

// const client_id = '4c0788b9290a4b14ad612e1483cb4e35';
// const client_secret = 'd2b9fcf6dc0d44d29fd48e62bab6e4e5';
// const redirect_uri = "https://spotimatch.herokuapp.com/criteria";

export function getAuthURL(redirect_uri) {
    // localStorage.setItem("client_id", client_id);
    // localStorage.setItem("client_secret", client_secret);
    var url = AUTHORIZE; 
    url += "?client_id=" + clientInfo['client_id'];
    url += "&response_type=code";
    url += "&redirect_uri=" + redirect_uri; 
    url += "&show_dialog=true"; 
    url += "&scope=user-read-private user-top-read user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private"

    window.location.href = url;
}


