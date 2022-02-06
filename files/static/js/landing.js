const AUTHORIZE = "https://accounts.spotify.com/authorize";
const client_id = '4c0788b9290a4b14ad612e1483cb4e35';
const client_secret = 'd2b9fcf6dc0d44d29fd48e62bab6e4e5';
const redirect_uri = "https://anthemy.herokuapp.com/criteria";


/**
 * gets the authorization url to be redirected to for the user to sign in to their Spotify
 * and allow access
 */
function getAuthURL() {
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret);
    var url = AUTHORIZE; 
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + redirect_uri;
    url += "&show_dialog=true"; 
    url += "&scope=user-read-private user-top-read user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private"

    window.location.href = url;
}

let details =  document.getElementById('details');
let summary = document.getElementsByClassName('unopened-summary')[0]; 

// styling details element on click 
details.addEventListener("toggle", () => {
    if (details.open) {
        details.classList.remove('unopened-details'); 
        summary.classList.remove('unopened-summary'); 
        details.classList.add('opened-details');  
        summary.classList.add('opened-summary'); 
    }
    else {
        details.classList.remove('opened-details');
        summary.classList.remove('opened-summary') 
        details.classList.add('unopened-details');
        summary.classList.add('unopened-summary');  
    }
})

document.getElementById('spotify-logo').addEventListener('click', () => {
    window.location.href = 'https://www.spotify.com/us/'; 
})

const deviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
    }
    return "desktop";
};

const type = deviceType(); 

fetch('/visit-tracker', {
    method: "POST", 
    credentials: "same-origin", 
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({"deviceType": type})
})