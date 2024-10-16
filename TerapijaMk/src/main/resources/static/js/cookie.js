let loggedInUser = false;
const checkIntervalDuration = 1000;
function getRoleFromCookie() {
    const name = "role=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for(let i = 0; i <cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return undefined;
}
function checkCookieAndUpdateUI() {
    const username = getCookie('username');
    const userRole=getRoleFromCookie();
    console.log(userRole);
    const authButton = document.getElementById('authButton');

    if (username) {
        if (!loggedInUser) {
            loggedInUser = true;
            authButton.innerText = 'Logout';
            authButton.style.display = 'block';
            localStorage.setItem('lastCheck', Date.now());
        }
        else{
            if(window.location.pathname === '/'){
                if(userRole==="ADMIN"){
                    window.location.href = '/admin.html';
                }
                else{
                    const personalisedSection=document.getElementById("personalised");
                    personalisedSection.innerHTML=`Добредојде, ${username}!`;
                    document.getElementsByClassName("logged-in")[0].style.display='block';
                    document.getElementById("adminSection").style.display='none';
                }

            }
        }

    }
        else {
        if (loggedInUser) {
            loggedInUser = false;
            authButton.style.display = 'none';
           // deleteCookie('username')
            window.location.href = '/';
        }
    }
}



function startCookieCheckInterval() {
    if (!window.cookieCheckInterval) {
        window.cookieCheckInterval = setInterval(() => {
            const lastCheck = localStorage.getItem('lastCheck');
            const timeSinceLastCheck = Date.now() - (lastCheck ? parseInt(lastCheck) : 0);
            if (timeSinceLastCheck >= checkIntervalDuration) {
                checkCookieAndUpdateUI();
            }
        }, 10);
    }
}
function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
function resetAuthState() {
    loggedInUser = false;
    const authButton = document.getElementById('authButton');
    authButton.style.display = 'none';
    localStorage.removeItem('lastCheck');
    clearInterval(window.cookieCheckInterval);
    window.cookieCheckInterval = null;
}

window.addEventListener('load',function() {

    const wasRefreshed=sessionStorage.getItem("refreshed");
    if(wasRefreshed){
        //deleteCookie("username");
        sessionStorage.removeItem("refreshed")
        if(getRoleFromCookie()==="ADMIN"){
            window.location.href="/admin.html";
        }
        else{
            window.location.href="/";
        }
    }
    else{
        sessionStorage.setItem("refreshed","true")
    }
    checkCookieAndUpdateUI();
    startCookieCheckInterval();
    let authButton=document.getElementById("authButton");
    authButton.addEventListener('click', () => {
        if (authButton.innerText === 'Logout') {
            deleteCookie('username');
            deleteCookie('role');
            resetAuthState();
                window.location.href="/";
        }
    });
});
window.addEventListener("beforeunload", function() {
    sessionStorage.removeItem("refreshed");
});