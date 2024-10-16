function deleteEntry(url,term,separator) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let retrievedData=data.data;
                let idto=retrievedData.split("&")[1];
                let infoto=retrievedData.split("&")[0];

                let statusField;
                if(separator==='request'){
                    statusField="cancelledRequest";
                }
                else if(separator==='appointment'){

                    statusField="cancelledAppointmentByUser";
                }
                const updateResponse = fetch(`/api/users/addTerm`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: idto,
                        term: term,
                        additionalInfo: infoto,
                        status: statusField
                    }),
                });

                if (updateResponse.ok) {
                    console.log(`User updated successfully.`);
                } else {
                    console.error(`Failed to update user. Status: ${updateResponse.status} - ${updateResponse.statusText}`);
                }
                location.reload();
            } else {
                alert('Failed to cancel the reservation.');
            }
        })
        .catch(error => console.error('Error:', error));
}


function cancelForm(type,data){
    let tempTerm=data[0].term;
    const overlay = document.createElement('div');
    overlay.setAttribute("id","popup");
    const dialog = document.createElement('div');
    dialog.setAttribute("id","dialogPopUp");
    const message = document.createElement('p');
    message.textContent = 'Дали сте сигурни дека сакате да откажете?';
    dialog.appendChild(message);
    const yesButton = document.createElement('button');
    yesButton.textContent = 'Yes';
    yesButton.style.marginRight = '10px';
    yesButton.classList.add('btn', 'btn-danger');

    const noButton = document.createElement('button');
    noButton.textContent = 'No';
    noButton.classList.add('btn', 'btn-secondary');
    dialog.appendChild(yesButton);
    dialog.appendChild(noButton);

    overlay.appendChild(dialog);

    document.body.appendChild(overlay);

    yesButton.addEventListener('click', () => {

        let url;
        let separator;
        if (type === 'request') {
            url = `/api/requests/cancelReservation?username=${username}&term=${tempTerm}`;
            separator="request";
        } else if (type === 'appointment') {
            url = `/api/appointments/cancelAppointment?username=${username}&term=${tempTerm}`;
            separator="appointment";
        }
        deleteEntry(url,tempTerm,separator);
        document.body.removeChild(overlay);
    });

    noButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
}
function replaceWithSpace(dateTimeString) {
    return dateTimeString.replace('T', ' ');
}

function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const username = getCookieValue('username');
function displayRequestsInTable(requests,buttonsConfig) {
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';
    toggleHead();
    requests.forEach(request => {
        const row = document.createElement('tr');
        const termCell = document.createElement('td');
        termCell.textContent = replaceWithSpace(request.term);
        row.appendChild(termCell);
        const nameCell = document.createElement('td');
        nameCell.textContent = request.name;
        row.appendChild(nameCell);
        const surnameCell = document.createElement('td');
        surnameCell.textContent = request.surname;
        row.appendChild(surnameCell);
        const couponCodeCell = document.createElement('td');
        couponCodeCell.textContent = request.couponCode;
        row.appendChild(couponCodeCell);
        const additionalInfoCell = document.createElement('td');
        additionalInfoCell.textContent = request.additionalInfo;
        row.appendChild(additionalInfoCell);
        const usernameCell = document.createElement('td');
        usernameCell.textContent = request.username;
        row.appendChild(usernameCell);
        const buttonCell = document.createElement('td');

        buttonsConfig.forEach(config => {
            const button = document.createElement('button');
            button.textContent = config.text;
            button.classList.add('btn', config.className);
            button.addEventListener('click', config.handler);
            buttonCell.appendChild(button);
        });

        row.appendChild(buttonCell);
        tableBody.appendChild(row);
    });
}
function toggleHead(data){
    const thead = document.getElementById('table-head');
    const oldHead = document.getElementById('initial-head');
    if (thead) {
        thead.innerHTML = '';
    }
    let newColumns;
    if(data==='carried_out'){
        newColumns = ['Термин', 'Feedback-корисник', 'Feedback-терапевт', 'Статус'];
    }
    else{
        newColumns = ['Термин', 'Име', 'Презиме', 'Купон','Дополнителни информации','Корисник','Откажи'];
    }
    const newHeadRow = document.createElement('tr');

    newColumns.forEach(columnText => {
        const th = document.createElement('th');
        th.textContent = columnText;
        newHeadRow.appendChild(th);
    });
    thead.appendChild(newHeadRow);
}
function displayCarriedOutInTable(data){
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';
    toggleHead("carried_out");
    data.forEach(request => {
        const row = document.createElement('tr');
        const termCell = document.createElement('td');
        termCell.textContent = replaceWithSpace(request.dateTime);
        row.appendChild(termCell);
        const userCell = document.createElement('td');
        userCell.textContent = request.userNote;
        row.appendChild(userCell);
        const adminCell = document.createElement('td');
        adminCell.textContent = request.adminNote;
        row.appendChild(adminCell);
        const statusCell = document.createElement('td');
        statusCell.textContent = request.status;
        row.appendChild(statusCell);
        tableBody.appendChild(row);
    });
}
function handleRequestedClick(){
    fetch(`/api/requests/listAll?username=${username}`)
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            displayRequestsInTable(data,[
                {
                    text: 'Откажи',
                    className: 'btn-danger',
                    handler: () => cancelForm("request",data)
                }
            ]);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function handleReservedClick(){
    fetch(`/api/appointments/listAll?username=${username}&status=RESERVED`)
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            displayRequestsInTable(data,[
                {
                    text: 'Откажи',
                    className: 'btn-danger',
                    handler: () => cancelForm("appointment",data)
                }
            ]);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function handleCarriedOutClick(){
    fetch(`/api/users/listAllCarriedOut?username=${username}`)
        .then(response => response.json())
        .then(data => {
            displayCarriedOutInTable(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


document.getElementById('requested').addEventListener('click', handleRequestedClick);
document.getElementById('reserved').addEventListener('click', handleReservedClick);
document.getElementById('carried-out').addEventListener('click', handleCarriedOutClick);