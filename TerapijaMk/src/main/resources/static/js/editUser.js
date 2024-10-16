
import { deleteAppointment, confirmCarriedOut, getUsersByTermExcept, removeRequestAndUpdateUser, removeAppointment, makeReservation ,displayDiv} from './shared.js';
import { verificationCheck } from './authentication-shared.js';

let loggedPerson,checkDifferent;
const modal = document.getElementById('popupModal');
const cancelBtn = document.getElementById('cancelBtn');
const approveBtn = document.getElementById('approveBtn');
const closeSpan = document.querySelector('.close');

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});
closeSpan.addEventListener('click', () => {
    modal.style.display = 'none';
});

function createAppointmentInfoField(selectedValue){
    const tableBody = document.getElementById("active-table");
    tableBody.innerHTML='';
    let dates;
    if(selectedValue==='not-completed'){
        dates=loggedPerson.dates;
    }
    else if(selectedValue==='completed'){
        dates=loggedPerson.carriedOut;
    }
    dates.forEach(date => {
        let row = document.createElement("tr");
        let tdTerm = document.createElement("td");
        tdTerm.innerText = date.dateTime.replace('T', ' ').substring(0, 16);
        let tdTemp1 = document.createElement("td");
        let tdTemp2 = document.createElement("td");
        if(selectedValue==='not-completed'){
            tdTemp1.innerText = date.note;
            switch(date.status){
                case "rejected":
                    tdTemp2.innerText = "Одбиен предлог(админ)";
                    break;
                case "cancelledRequest":
                    tdTemp2.innerText = "Одбиен предлог(корисник)";
                    break;
                case "cancelledAppointmentByUser":
                    tdTemp2.innerText = "Откажан термин(корисник)";
                    break;
                case "cancelledAppointmentByAdmin":
                    tdTemp2.innerText = "Откажан термин(админ)";
                    break;
                default:
                    console.log("Problem with status");
                    break;
            }

        }
        else{
            tdTemp1.innerText = date.userNote;
            tdTemp2.innerText = date.adminNote;
        }
        row.appendChild(tdTerm);
        row.appendChild(tdTemp1);
        row.appendChild(tdTemp2);
        tableBody.appendChild(row);
    });
}
function countStatus(user, status) {
    let counter=0;
    if(status!=="carried_out"){
        counter= user.dates.filter(appointment => appointment.status === status).length;
    }
    else{
        counter= user.carriedOut.length;
    }
    return counter;
}
function createHeader(headersArray){
    const tableHead=document.getElementById("active-tableHead");
    tableHead.innerHTML='';
    const headerRow = document.createElement('tr');

    headersArray.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    tableHead.appendChild(headerRow);
}

async function getAll(url) {
    const tableBody = document.getElementById("active-table");
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    tableBody.innerHTML = '';
    data.forEach(request => {
        const row = document.createElement('tr');
        const termCell = document.createElement('td');
        termCell.textContent = request.term.replace('T', ' ').substring(0, 16);
        row.appendChild(termCell);
        const additionalInfoCell = document.createElement('td');
        additionalInfoCell.textContent = request.additionalInfo;
        row.appendChild(additionalInfoCell);

        const button1 = document.createElement('button');
        const button2 = document.createElement('button');
        const buttonCell = document.createElement('td');
        if(url.includes("requests")){
            button1.textContent = "Прифати";
            button1.addEventListener('click', () => displayDiv(request.term, loggedPerson.username));
            buttonCell.appendChild(button1);
            button2.textContent = "Одбиј";
            button2.addEventListener('click',()=>removeRequestAndUpdateUser(request.term,loggedPerson.id,"rejected"));
            buttonCell.appendChild(button2);
        }
        else{
            button1.textContent = "Откажи";
            button1.addEventListener('click',()=> removeAppointment(request.term,"cancelledAppointmentByAdmin"));
            buttonCell.appendChild(button1);
            button2.textContent = "Потврди одржан";
            buttonCell.appendChild(button2);
            button2.addEventListener('click',()=> {
                modal.style.display='flex';
                document.getElementById("userInput").disabled=false;
            });
            approveBtn.addEventListener('click', () => {
                const userInput = document.getElementById('userInput').value;
                confirmCarriedOut(request.term,userInput);
                modal.style.display = 'none';
            });

        }

        row.appendChild(buttonCell);
        tableBody.appendChild(row);
    });

}
function createRowsBasedOnType(){
    let url;
    let tHeadArray=["Термин","Медицинска состојба", "Статус"];
    const dropdown = document.getElementById('statusDropdown');
    const selectedValue = dropdown.value;
    if(selectedValue==="requests"){
        url=`/api/requests/listAll?username=${loggedPerson.username}`;
        tHeadArray=["Термин","Медицинска состојба","Опции"];
        createHeader(tHeadArray);
        getAll(url);
    }
    else if(selectedValue==="appointments"){
        let testTemp="RESERVED";
        url=`/api/appointments/listAll?username=${loggedPerson.username}&status=${testTemp}`;
        tHeadArray=["Термин","Медицинска состојба", "Опции"];
        createHeader(tHeadArray);
        getAll(url);
    }
    else if(selectedValue==="not-completed"){
        createHeader(tHeadArray);
        createAppointmentInfoField(selectedValue);
    }
    else if(selectedValue==="completed"){
        tHeadArray=["Термин","Забелешка-клиент", "Забелешка-терапевт"];
        createHeader(tHeadArray);
        createAppointmentInfoField(selectedValue);
    }

    dropdown.selectedIndex = 0;
}
async function createAdminInfoField(user) {
    document.getElementById("carried-out").innerText = countStatus(user, "carried_out").toString();
    document.getElementById("rejected").innerText = countStatus(user, "rejected").toString();
    document.getElementById("cancelledReqByUser").innerText = countStatus(user, "cancelledRequest").toString();
    document.getElementById("cancelledAppByUser").innerText = countStatus(user, "cancelledAppointmentByUser").toString();
    document.getElementById("cancelledAppByAdmin").innerText = countStatus(user, "cancelledAppointmentByAdmin").toString();
}
function updateButtonText(isBlocked) {
    const button = document.getElementById('block-account');
    button.innerText = isBlocked ? "Активирај к.сметка" : "Блокирај к.сметка";
}
function fetchUserData(username,role) {
    return fetch(`/api/users/editUser?username=${username}`)
        .then(response => {
            console.log('Response:', response);
            return response.json()})
        .then(data => {
            loggedPerson=data;
            document.querySelector('input[name="username"]').value = data.username || '';
            document.querySelector('input[name="firstName"]').value = data.name || '';
            document.querySelector('input[name="lastName"]').value = data.surname || '';
            document.querySelector('input[name="phone"]').value = data.phone || '';
            document.querySelector('input[name="age"]').value = data.dateBirth || '';
            if(role==='ADMIN'){
                createAdminInfoField(data);
                let blockedButton=document.getElementById("block-account");
                blockedButton.style.display='block';
                    fetch(`/api/users/blockedStatus?username=${username}`)
                        .then(response => response.json())
                        .then(data => {
                            updateButtonText(data.isBlocked);
                        })
                        .catch(error => {
                            console.error('Error fetching user status:', error);
                        });
                blockedButton.addEventListener('click',()=>{
                    fetch(`/api/users/toggleBlock?username=${username}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then(response => response.json())
                        .then(data=>{
                            if (data.message === "User status updated") {
                                const currentText = document.getElementById('block-account').innerText;
                                updateButtonText(currentText === "Блокирај к.сметка");
                            } else {
                                console.error('Error updating user status:', data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                });
            }

            return { name: data.name, surname: data.surname };
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            return { name: '', surname: '' };
        });
}
function updateCookieUsername(newUsername) {
    document.cookie = `username=${newUsername}; path=/;`;
}


function getCookie(name) {
    const nameEQ = name + "=";
    console.log(document.cookie);
    const cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i].trim();
        if (cookie.indexOf(nameEQ) === 0)
            console.log(cookie.split("=")[1])
        return cookie.split("=")[1];
    }
    return null;
}
function updateProfile() {
    const params=getQueryParams();
    const username = params.param2;
    const role=params.param1;
    if(username && role==='ADMIN'){
        fetchUserData(username,"ADMIN").then(r => {
            console.log("success from admin")
            document.getElementById("adminInfo-block").style.display='block';
        })
    }
    else{

        document.getElementById("edit-profile").style.display='none';
        document.getElementById("saveChanges").style.display='none';
        const cookieUsername = getCookie('username');
        if (cookieUsername) {
            fetchUserData(cookieUsername,"USER").then(userData => {
            console.log("success")
            });
        }
    }
}
function saveProfileChanges() {
    const userName = document.querySelector('input[name="username"]').value;
    const phoneNum=document.querySelector('input[name="phone"]').value.replace(/-/g,"")
    console.log(phoneNum);
    const updatedData = {
        username: userName,
        name: document.querySelector('input[name="firstName"]').value,
        surname: document.querySelector('input[name="lastName"]').value,
        phone: phoneNum,
        age: document.querySelector('input[name="age"]').value
    };
    if(!verificationCheck(updatedData,checkDifferent)){
        return;
    }

    fetch(`/api/users/updateUser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
        .then(response => console.log(response.json()))
        .then(data => {
            alert('Profile updated successfully!');
            toggleEditing(false);
            updateCookieUsername(userName);
        })
        .catch(error => {
            console.error('Error updating user data:', error);
        });
}
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        param1: params.get('param1'),
        param2: params.get('param2')
    };
}
function removeOptions(){
    if(getRoleFromCookie()!=="ADMIN"){
        let temp=this;
        temp.removeChild(document.getElementById("requests"));
        temp.removeChild(document.getElementById("appointments"))
    }
}

function toggleEditing(isEnabled) {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.disabled = !isEnabled;
    });
}

window.onload = function(){
    checkDifferent=true;
    updateProfile();
    toggleEditing(false);
    document.getElementById('edit-profile').addEventListener('click', function() {
       const role=getQueryParams();
       if(role.param1 ==='ADMIN'){
           toggleEditing(true);
           checkDifferent=false;
       }

    });
    document.getElementById('saveChanges').addEventListener('click', saveProfileChanges);
    document.getElementById("statusDropdown").addEventListener('change',createRowsBasedOnType);
    document.getElementById("statusDropdown").addEventListener('click',removeOptions);
}