function updateSearchInputVisibility(data) {
    const searchInputContainer = document.getElementById("search-input-container");
    if (data !== 'defaultValue') {
        searchInputContainer.style.display = 'block';
    } else {
        searchInputContainer.style.display = 'none';
    }
}

function setInitialSelectValue(selectedElement){
    selectedElement.selectedIndex=0;
}
function calculateAge(dateBirth){
    const [year, month, day] = dateBirth.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    if (currentMonth < (birthDate.getMonth()) || (currentMonth === birthDate.getMonth() && currentDay < birthDate.getDate())) {
        age--;
    }

    return age;
}

function renderTable(filteredUsers) {

    const tbody = document.querySelector("#users-table tbody");
    tbody.innerHTML = ""; // Clear existing rows
    if(filteredUsers.length===0){
        return;
    }

    filteredUsers.forEach(user => {
        const row = document.createElement("tr");

        for (const key of ["username", "name", "surname", "dateBirth", "phone"]) {
            const cell = document.createElement("td");
            if(key==='dateBirth'){
                let ageTemp=calculateAge(user[key]);
                cell.textContent=ageTemp.toString();
            }
            else{
                cell.textContent = user[key];
            }
            row.appendChild(cell);
        }

        const buttonCell = document.createElement("td");
        const button = document.createElement("button");
        button.textContent = "Преглед на корисник";
        button.addEventListener('click',()=>{
            let temp=user.username;
                const params = new URLSearchParams({ param1: 'ADMIN', param2: temp }).toString();
                window.location.href = `editUser.html?${params}`;
        })
        buttonCell.appendChild(button);
        row.appendChild(buttonCell);
        tbody.appendChild(row);
    });
}


async function filterUsers(byParam,selectedValue) {
    let url=`api/users/getUsersByParameter?parameter=${byParam}&filter=${selectedValue}`;
    try{
      const response=await fetch(url);
      if(!response.ok){
              console.log('Network response was not ok');
      }
      else{
          const users=await response.json();
          renderTable(users);
     }
    }
    catch(error){
        console.log("Error fetching users");
    }
}

let userStatusElement=document.getElementById("users-status");
let userParameterElement=document.getElementById("users-parameters");

userStatusElement.addEventListener("change", (event)=>{
    setInitialSelectValue(userParameterElement);
   document.getElementById("search-input-container").style.display = 'none';
    const selectedValue = event.currentTarget.value;
    if(selectedValue!=='defaultValue')
    filterUsers("status",selectedValue).then(r => console.log(r));
});

userParameterElement.addEventListener("change", (event)=>{
    setInitialSelectValue(userStatusElement);
    const dataCheck = event.currentTarget.value;
    updateSearchInputVisibility(dataCheck);

    document.getElementById("search-button").addEventListener('click',function (){
        let filterTemp=document.getElementById("search-input");
        filterUsers(dataCheck,filterTemp.value).then(r => console.log(r));
        filterTemp.value='';
    })
});


