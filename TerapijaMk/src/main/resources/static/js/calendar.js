let lastClickedItem=null;
let calendar = document.querySelector('.calendar')

const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function showModal() {
    const modal = document.getElementById('confirmation-modal');
    modal.classList.add('modal');
    modal.style.display = 'block';
}
document.getElementById("cancel-booking").addEventListener("click", function() {
    window.location.reload();
});

document.getElementById('book-button').addEventListener('click', () => {
    if (!window.selectedTime) {
        alert('Please select an appointment time.');
        return;
    }
    else{
        document.getElementById("last-check").innerHTML=window.selectedTime;
        showModal();
        document.getElementById("coupon-type").selectedIndex=0;
        document.getElementById("medical-condition").innerHTML='';

    }

});

document.getElementById("confirm-booking").addEventListener("click",function(){

    const termData={
        term: window.selectedTime,
        couponCode: document.getElementById("coupon-type").value,
        medicalCondition:document.getElementById("medical-condition").value
    };
    fetch('/api/requests/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(termData)
    })
        .then(response => {
            if (response.ok) {
                alert('Appointment booked successfully!');
                document.getElementById('confirmation-modal').style.display = 'none';
                 window.selectedTime = null;
                document.getElementById('book-button').disabled = true;
            } else {
                alert('Failed to book the appointment.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while booking the appointment.');
        });
});

isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 ===0)
}

getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28
}
function fetchFreeOrPendingAppointments(date) {
    fetch(`/api/appointments/free?date=${date}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayFreeAppointments(data);
        })
        .catch(error => console.error('Error fetching free appointments:', error));
}
function displayFreeAppointments(appointments) {
    const container = document.getElementById('hourly-terms');
    container.innerHTML = '';

    appointments.forEach(appointment => {
        const appointmentDiv = document.createElement('div');
        appointmentDiv.classList.add('appointment-item');
        appointmentDiv.style.border = '1px solid black';
        appointmentDiv.style.padding = '20px';
        appointmentDiv.style.display = 'inline-block';
        appointmentDiv.style.marginRight = '10px';

        const appointmentDate = new Date(appointment.term);
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedTime = appointmentDate.toLocaleTimeString([], timeOptions);
        const formattedDate=appointmentDate.toLocaleDateString('en-CA', dateOptions);

        appointmentDiv.textContent = formattedTime;
        appointmentDiv.dataset.time = formattedDate+" "+formattedTime;

        appointmentDiv.addEventListener('click', () => {
            if(lastClickedItem){
                lastClickedItem.style.backgroundColor="white";
            }
            lastClickedItem=appointmentDiv;
            lastClickedItem.style.backgroundColor="grey";
            window.selectedTime = appointmentDiv.dataset.time;
            document.getElementById('book-button').disabled = false;
        });

        container.appendChild(appointmentDiv);
    });
}

generateCalendar = (month, year) => {

    let calendar_days = calendar.querySelector('.calendar-days')
    let calendar_header_year = calendar.querySelector('#year')

    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    calendar_days.innerHTML = ''

    let currDate = new Date()

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
            day.addEventListener('click', () => {
                let temp=document.getElementsByClassName('curr-date');
                Array.from(temp).forEach(element => {
                    element.classList.remove('curr-date');
                });
                day.classList.add('curr-date');
                document.getElementById("coupon-type").selectedIndex=0;
                document.getElementById("medical-condition").value='';
                fetchFreeOrPendingAppointments(selectedDate);
            })

            if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
                day.classList.add('curr-date')
            }
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


window.onload = async function () {
temp=document.getElementById("coupon-type");
    try{
        const response = await fetch(`/api/coupons/getCouponNames`);
        if (response.ok) {
            const couponNames = await response.json();
            console.log("Coupons:", couponNames);

            couponNames.forEach(coupon => {
                const option = document.createElement("option");
                option.value = coupon;
                option.textContent = coupon;
                temp.appendChild(option);
            });
        } else {
            console.log(response.statusText);
        }
    }
    catch(error){
        console.error("Error fetching coupons:", error);
    }

};
