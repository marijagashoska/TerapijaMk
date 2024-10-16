export function deleteAppointment(term,type){
    if (typeof type !== 'undefined'){
        fetch(`/api/requests/listRequests?term=${term}`)
            .then(response => response.json())
            .then(userIds=>{
                console.log(userIds);
            })
            .catch(error => {
                console.error('Error fetching user IDs:', error);
            });
    }


    fetch(`/api/appointments/deleteAppointment?term=${term}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete the appointment');
            }
            else{
                location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
export function confirmCarriedOut(term,userInput){
    removeAppointment(term,"carriedOut")
        .then(async resultString => {
            let additionalInfo = resultString.split("&")[0];
            let userId = resultString.split("&")[1];
            const updateResponse = await fetch(`/api/users/carriedOut`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    term: term,
                    additionalInfo: additionalInfo,
                    status: "carried_out",
                    note: userInput
                }),
            });

            if (updateResponse.ok) {
                location.reload();
                console.log(`User updated successfully in carried_out`);
            } else {
                console.error(`Failed to update user. Status: ${updateResponse.status} - ${updateResponse.statusText}`);
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });


}
export async function getUsersByTermExcept(term, excludedUsername) {
    try {
        const response = await fetch(`api/requests/users-by-term?term=${term}&excludedUsername=${excludedUsername}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const users = await response.json();
        console.log('Users:', users);
        for (const userId of users.ids) {
            await removeRequestAndUpdateUser(term, userId,"rejected");
        }

    } catch (error) {
        console.error('Error fetching users:', error);
    }
}
export async function removeRequestAndUpdateUser(term,userId,status){
    try {
        const removeResponse = await fetch(`/api/requests/removeRequest?term=${term}&userId=${userId}`, {
            method: 'GET',
        });

        if (removeResponse.ok) {
            const additionalInfo = await removeResponse.text();
            console.log("Removed appointment datetime:", additionalInfo);
            if(status!=="carriedOut"){
                const updateResponse = await fetch(`/api/users/addTerm`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        term: term,
                        additionalInfo: additionalInfo,
                        status: status
                    }),
                });

                if (updateResponse.ok) {
                    console.log(`User updated successfully.`);
                } else {
                    console.error(`Failed to update user. Status: ${updateResponse.status} - ${updateResponse.statusText}`);
                }
            }
            else{
                return additionalInfo;
            }

        } else {
            console.error(`Failed to remove request. Status: ${removeResponse.status} - ${removeResponse.statusText}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }

}
export async function removeAppointment(term,extra) {
    let temp;
    try {
        const response = await fetch(`/api/appointments/removeUserFromAppointment?term=${term}`, {
            method: 'PUT',
        });

        if (response.ok) {
            const userId = await response.text();
            if(extra!=="carriedOut"){
                temp=extra;
                await removeRequestAndUpdateUser(term,userId,temp);
            }
            else{
                temp=extra;
                let importantAdditional=await removeRequestAndUpdateUser(term,userId,temp);
                deleteAppointment(term,extra);
                return importantAdditional+"&"+userId;

            }
            location.reload();

        } else {
            console.error("Failed to get userId");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
export async function makeReservation(dateTime,approvedUser){
    try {
        const response = await fetch(`/api/appointments/addAppointments?username=${approvedUser}&dateTime=${dateTime}`);
        if (response.ok) {
            console.log('Appointment added successfully.');
            location.reload();
        } else {
            const text = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Response: ${text}`);
        }
    } catch (error) {
        console.error('Error adding appointment:', error);
    }
    getUsersByTermExcept(dateTime, approvedUser).then(r => console.log("success"));
}
export function displayDiv(dateTime,username){
    if (typeof username !== 'undefined'){
        makeReservation(dateTime, username);
    }
    else{
        let temp=document.getElementById("confirm-approval");
        temp.addEventListener('click',()=>{
            const approvedUser = document.getElementById("username-approval").value;
            makeReservation(dateTime,approvedUser)
        });
    }
}