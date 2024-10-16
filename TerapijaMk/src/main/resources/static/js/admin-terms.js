import { deleteAppointment, confirmCarriedOut, getUsersByTermExcept, removeRequestAndUpdateUser, removeAppointment, makeReservation ,displayDiv} from './shared.js';

let lastClickedItem=null;
let calendar = document.querySelector('.calendar')
let importantDate;
const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const modal = document.getElementById('popupModal');
const cancelBtn = document.getElementById('cancelBtn');
const approveBtn = document.getElementById('approveBtn');
const closeSpan = document.querySelector('.close');
const deleteBtn=document.getElementById("temporal-deletion");

function resetFields() {
    document.getElementById('start-time').selectedIndex = 0;
    document.getElementById('timePicker').selectedIndex=0;
    document.getElementById('end-time').selectedIndex=0;
    document.getElementById('time-interval').value = '';
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value='';
    document.getElementById('delete-date-from').value='';
    document.getElementById('delete-date-to').value='';
}
function checkOverlap(existingTimes, newTime) {
    const [newHour, newMinutes] = newTime.split(':').map(Number);

    const newStartTime = new Date(0, 0, 0, newHour, newMinutes);
    const newEndTime = new Date(newStartTime);
    newEndTime.setHours(newEndTime.getHours() + 1);

    return existingTimes.some(existingTime => {
        const [existingHour, existingMinutes] = existingTime.split(':').map(Number);
        const existingStartTime = new Date(0, 0, 0, existingHour, existingMinutes);
        const existingEndTime = new Date(existingStartTime);
        existingEndTime.setHours(existingEndTime.getHours() + 1);
        return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });
}
async function getExistingAppointmentsMapped() {
    let existingAppointments;
    try {
        const response = await fetch(`/api/appointments/getAllAppointments`);
        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }
        existingAppointments = await response.json();
        console.log(existingAppointments);
    } catch (error) {
        console.error(error);
    }

    const appointmentMap = new Map();
    existingAppointments.forEach(appointment => {
        const dateTime = new Date(appointment.term);
        const date = dateTime.toISOString().split('T')[0];
        const time = dateTime.toTimeString().substring(0, 5);
        if (appointmentMap.has(date)) {
            appointmentMap.get(date).push(time);
        } else {
            appointmentMap.set(date, [time]);
        }
    });
    return appointmentMap;
}
function createAppointments(startDate, endDate, startTime, endTime, interval) {
    let appointments = [];
    let currentDate = new Date(startDate);
    let endDateObj = new Date(endDate);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    while (currentDate <= endDateObj) {
        let currentStartTime = new Date(currentDate);
        currentStartTime.setHours(startHour, startMinute, 0, 0);

        let currentEndTime = new Date(currentDate);
        currentEndTime.setHours(endHour - 1, endMinute+interval, 0, 0);

        while (currentStartTime < currentEndTime) {
            const formattedDate = currentDate.toISOString().split('T')[0];
            appointments.push({
                date: formattedDate,
                time: currentStartTime.toTimeString().substring(0, 5)
            });
            currentStartTime.setMinutes(currentStartTime.getMinutes() + interval + 60);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return appointments;
}

function formatConflictAlert(conflictingAppointments) {
    const appointmentList = Array.isArray(conflictingAppointments) ? conflictingAppointments : [conflictingAppointments];
    const formattedAppointments = appointmentList.map(appointment =>
        `Датум: ${appointment.date}, Време: ${appointment.time}`
    );

    const alertMessage = [
        "Неуспешно креирање на термини:",
        ...formattedAppointments
    ].filter(Boolean).join('\n');

    return alertMessage.trim();
}

async function createAutoAppointments(appointments) {
    const requestBody = appointments.map(appointment => ({
        date: appointment.date,
        time: appointment.time,
    }));

    const response=await fetch(`/api/appointments/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    if(response.ok){
        location.reload();
    }

}
document.getElementById('create-appointments').addEventListener('click', async function () {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const interval = parseInt(document.getElementById('time-interval').value);

    if (!startDate || !endDate || !startTime || !endTime || isNaN(interval)) {
        alert("Please fill out all the fields.");
        return;
    }

    const appointments = createAppointments(startDate, endDate, startTime, endTime, interval);
    console.log('Generated Appointments:', appointments);

    const existingMapped =  await getExistingAppointmentsMapped();
    const conflictingAppointments = [];
    const successfulAppointments = [];

    appointments.forEach(newAppointment => {
        const { date, time } = newAppointment;

        if (existingMapped.has(date)) {
            const existingTimes = existingMapped.get(date);
            if (checkOverlap(existingTimes, time)) {
                conflictingAppointments.push(newAppointment);
            } else {
                successfulAppointments.push(newAppointment);
            }
        } else {
            successfulAppointments.push(newAppointment);
        }
    });
    console.log(conflictingAppointments);
    console.log(successfulAppointments);
    if(successfulAppointments.length>0){
        await createAutoAppointments(successfulAppointments);
    }
    if (conflictingAppointments.length > 0) {
        const alertMessage = formatConflictAlert(conflictingAppointments);
        alert(alertMessage);
    }
    resetFields();
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

closeSpan.addEventListener('click', () => {
    modal.style.display = 'none';
});

deleteBtn.addEventListener('click',()=>{
    deleteAppointment(deleteBtn.getAttribute("term"),deleteBtn.getAttribute("type"));
})

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

function cleanAssets() {
    const ids = ['request-assets', 'appointment-assets'];
    ids.forEach((id) => {
        const element = document.getElementById(id);
        if (element && element.style.display !== 'none') {
            element.style.display = 'none';
        }
    });
}


async function isAppointmentReserved(dateTime) {
    try {
        const response = await fetch(`/api/appointments/isReserved?term=${dateTime}`);
        return await response.json();
    } catch (error) {
        console.error('Error checking if appointment reserved:', error);
        return false;
    }
}
async function isAppointmentEmpty(dateTime) {
    try {
        const response = await fetch(`/api/requests/isEmpty?term=${dateTime}`);
        return await response.json();
    } catch (error) {
        console.error('Error checking if no requests:', error);
        return false;
    }
}
function cleanData(bodyId){
    const element = document.getElementById(bodyId);
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}
function createLines(data,dateTime,whichOne){
    cleanData(whichOne)
    if(!Array.isArray(data)){
        data=[data];
    }

    let requestedElement=document.getElementById(whichOne);
    data.forEach(item => {
        const requestedRow = document.createElement('tr');
        const usernameTd = document.createElement('td');
        usernameTd.textContent = item.username;
        requestedRow.appendChild(usernameTd);
        const nameTd = document.createElement('td');
        nameTd.textContent = item.name;
        requestedRow.appendChild(nameTd);
        const surnameTd = document.createElement('td');
        surnameTd.textContent = item.surname;
        requestedRow.appendChild(surnameTd);
        const additionalInfoTd = document.createElement('td');
        additionalInfoTd.textContent = item.additionalInfo;
        requestedRow.appendChild(additionalInfoTd);
        const couponCodeTd = document.createElement('td');
        couponCodeTd.textContent = item.couponCode;
        requestedRow.appendChild(couponCodeTd);
        requestedElement.appendChild(requestedRow);
    })
    displayDiv(dateTime);
}
function getAllRequests(dateTime,containerId){
    let url;
    if(containerId === "approved"){
        url = `/api/appointments/listApprovedRequest?term=${dateTime}`;
    } else {
        url = `/api/requests/listRequests?term=${dateTime}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            createLines(data,dateTime,containerId)
        })
        .catch(error => {
            console.error('Error fetching requests:', error);
        });
}
function createActiveAppointments(data){
    const frameElement=document.getElementById("frame");
    frameElement.innerHTML = '';
    document.getElementById("approved-table").style.display = 'none';
    document.getElementById("requested-table").style.display = 'none';
    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.style.border = '1px solid black';
        itemDiv.style.padding = '20px';
        itemDiv.style.display = 'inline-block';
        itemDiv.style.marginRight = '10px';

        const appointmentDate = new Date(item.localDateTime);
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        itemDiv.textContent = appointmentDate.toLocaleTimeString([], timeOptions);

        itemDiv.addEventListener('click', async () => {
            document.getElementById("summary").style.display='none';
            try{
                if(lastClickedItem){
                    lastClickedItem.style.backgroundColor="#f9f9f9";
                }
                lastClickedItem=itemDiv;
                itemDiv.style.backgroundColor="grey";
                const isReserved=await isAppointmentReserved(item.localDateTime);
                const isEmpty=await isAppointmentEmpty(item.localDateTime);
                cleanAssets();
                cleanData("approved")
                cleanData("requested")
                if (isReserved) {
                    document.getElementById("summary").style.display='block';
                    document.getElementById("approved-table").style.display = 'block';
                    document.getElementById("requested-table").style.display = 'none';
                    getAllRequests(item.localDateTime,"approved","");
                    document.getElementById("appointment-assets").style.display='block';
                    deleteBtn.style.display='block';
                    deleteBtn.setAttribute("term",item.localDateTime);
                    deleteBtn.setAttribute("type","cancelledAppointmentByAdmin");
                    document.getElementById("delete-approval").addEventListener('click', function() {
                        removeAppointment(item.localDateTime,"cancelledAppointmentByAdmin");
                    });
                    document.getElementById("approve-carried-out").addEventListener('click', function() {
                        modal.style.display = 'flex';
                        approveBtn.addEventListener('click', () => {
                            const userInput = document.getElementById('userInput').value;
                            confirmCarriedOut(item.localDateTime,userInput);
                            modal.style.display = 'none';
                        });

                    });
                }
                else if(!isEmpty){
                    document.getElementById("summary").style.display='block';
                    document.getElementById("approved-table").style.display = 'none';
                    document.getElementById("requested-table").style.display = 'block';
                    getAllRequests(item.localDateTime,"requested","");
                    document.getElementById("request-assets").style.display='block';
                    deleteBtn.style.display='block';
                    deleteBtn.setAttribute("term",item.localDateTime);
                    deleteBtn.setAttribute("type","rejected");
                }
                else{
                    document.getElementById("summary").style.display='none';
                    document.getElementById("approved-table").style.display = 'none';
                    document.getElementById("requested-table").style.display = 'none';
                    deleteBtn.style.display='block';
                    deleteBtn.setAttribute("term",item.localDateTime);
                }


            }
            catch(error){
                console.error('Error checking appointment reservation:', error);
            }

        });

        frameElement.appendChild(itemDiv);
    });
}
function fetchAppointments(date){
    deleteBtn.style.display='none';
    fetch(`/api/appointments/listAppointments?date=${date}`)
        .then(response => response.json())
        .then(data => {
            createActiveAppointments(data);
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });
}

const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 ===0)
}

const getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28
}


const generateCalendar = (month, year) => {

    let calendar_days = calendar.querySelector('.calendar-days')
    let calendar_header_year = calendar.querySelector('#year')

    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    calendar_days.innerHTML = ''

    let currDate = new Date()

    console.log(month);
    if (typeof month !== 'number') month = currDate.getMonth();
    if (!year) year = currDate.getFullYear()

    let curr_month = `${month_names[month]}`
    month_picker.innerHTML = curr_month
    calendar_header_year.innerHTML = year


    let first_day = new Date(year, month, 1)

    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let day = document.createElement('div')
        if (i >= first_day.getDay()) {
            day.classList.add('calendar-day-hover')
            day.innerHTML = i - first_day.getDay() + 1;
            day.innerHTML += `<span></span>
                            <span></span>
                            <span></span>
                            <span></span>`;
            let selectedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${(i - first_day.getDay() + 1).toString().padStart(2, '0')}`;
            if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
                day.classList.add('curr-date')
                importantDate=selectedDate;
                document.getElementById("insert-date").innerText=importantDate;
                fetchAppointments(importantDate);
            }
            day.addEventListener('click', () => {
                document.getElementById("summary").style.display='none';
                let temp=document.getElementsByClassName('curr-date');
                Array.from(temp).forEach(element => {
                    element.classList.remove('curr-date');
                });
                importantDate=selectedDate;
                let daySpan= document.getElementById("insert-date");
                daySpan.innerText="";
                daySpan.innerText=importantDate;
                day.classList.add('curr-date');
                fetchAppointments(importantDate);
                cleanAssets();
                cleanData("approved")
                cleanData("requested")
                resetFields();
            });
        }
        calendar_days.appendChild(day)
    }
}

let month_list = calendar.querySelector('.month-list')

month_names.forEach((e, index) => {
    let month = document.createElement('div')
    month.innerHTML = `<div data-month="${index}">${e}</div>`
    month.querySelector('div').onclick = () => {
        month_list.classList.remove('show')
        curr_month.value = index
        generateCalendar(index, curr_year.value)
    }
    month_list.appendChild(month)
})

let month_picker = calendar.querySelector('#month-picker')

month_picker.onclick = () => {
    month_list.classList.add('show')
}

let currDate = new Date()

let curr_month = {value: currDate.getMonth()}
let curr_year = {value: currDate.getFullYear()}

generateCalendar(curr_month.value, curr_year.value)

document.querySelector('#prev-year').onclick = () => {
    --curr_year.value
    generateCalendar(curr_month.value, curr_year.value)
}

document.querySelector('#next-year').onclick = () => {
    ++curr_year.value
    generateCalendar(curr_month.value, curr_year.value)
}
function populateTimePicker() {
    const timePicker = document.getElementById('timePicker');
    const timePickerStart = document.getElementById('start-time');
    const timePickerEnd = document.getElementById('end-time');

    const timePickerInterval = 10;
    const otherPickersInterval = 30;

    for (let hour = 7; hour < 22; hour++) {
        for (let minutes = 0; minutes < 60; minutes++) {
            const formattedHour = hour.toString().padStart(2, '0');
            const formattedMinutes = minutes.toString().padStart(2, '0');


            if (minutes % timePickerInterval === 0) {
                let timeOption = document.createElement('option');
                timeOption.value = `${formattedHour}:${formattedMinutes}`;
                timeOption.text = `${formattedHour}:${formattedMinutes}`;
                timePicker.appendChild(timeOption);
            }

            if (minutes % otherPickersInterval === 0) {
                let timeOptionStart = document.createElement('option');
                timeOptionStart.value = `${formattedHour}:${formattedMinutes}`;
                timeOptionStart.text = `${formattedHour}:${formattedMinutes}`;
                timePickerStart.appendChild(timeOptionStart);

                let timeOptionEnd = document.createElement('option');
                timeOptionEnd.value = `${formattedHour}:${formattedMinutes}`;
                timeOptionEnd.text = `${formattedHour}:${formattedMinutes}`;
                timePickerEnd.appendChild(timeOptionEnd);
            }
        }
    }
}

function createSeparateAppointment(data){
    fetch('/api/appointments/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Unknown error');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function deleteFreeAppointments() {
    const selectedDateFrom = document.getElementById('delete-date-from').value;
    const selectedDateTo = document.getElementById('delete-date-to').value;
    if (!selectedDateFrom && !selectedDateTo) {
        alert("Please select dates!");
        return;
    }

    try {
        const response = await fetch(`/api/appointments/deleteFree?startDate=${selectedDateFrom}&endDate=${selectedDateTo}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert("Free appointments for the selected date range were deleted.");
            location.reload();
        } else {
            alert("An error occurred while trying to delete the appointments.");
        }
    } catch (error) {
        console.error("Error deleting appointments:", error);
        alert("A network error occurred while trying to delete the appointments.");
    }
    document.getElementById('delete-date-from').value='';
    document.getElementById('delete-date-to').value='';
}

populateTimePicker();
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('start-date').setAttribute('min', formattedDate);
    document.getElementById('end-date').setAttribute('min',formattedDate);
    const addTermButton = document.getElementById('add-Term');
    const timePicker = document.getElementById('timePicker');
    timePicker.addEventListener('click',()=>{
        document.getElementById('start-time').selectedIndex = 0;
        document.getElementById('end-time').selectedIndex=0;
        document.getElementById('time-interval').value = '';
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value='';
        document.getElementById('delete-date-from').value='';
        document.getElementById('delete-date-to').value='';
    })
    addTermButton.addEventListener('click',async () => {
        const selectedTime = timePicker.value;
        if (importantDate && selectedTime) {
            console.log(`Selected Date: ${importantDate}`);
            console.log(`Selected Time: ${selectedTime}`);

            const data = {
                date: importantDate,
                time: selectedTime
            };


            const mapped = await getExistingAppointmentsMapped();
            if (mapped.has(importantDate)) {
                const existingTimes = mapped.get(importantDate);
                if (checkOverlap(existingTimes, selectedTime)) {
                    const alertMessage = formatConflictAlert(data);
                    alert(alertMessage);
                } else {
                    createSeparateAppointment(data);
                }
            }
            else {
                createSeparateAppointment(data);
            }
            resetFields();
        } else {
            console.error('Please select a date and time.');
        }
    });

    let tempContainer=document.getElementsByClassName('appointment-section')[0];
    tempContainer.addEventListener('click',()=>{
        document.getElementById('timePicker').selectedIndex=0;
    })
    document.getElementById('delete-free-button').addEventListener('click', deleteFreeAppointments);
});


