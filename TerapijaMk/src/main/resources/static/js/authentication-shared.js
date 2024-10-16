function usernameCheck(username){
    const regex = /^(?=.*[A-Za-z])[A-Za-z0-9]+$/;
    return regex.test(username);
}
function nameSurnameCheck(name,surname){
   const regex=/^[АБВГДЃЕЖЗЅИЈКЛЉМНЊОПРСТЌУФХЦЧЏШ][абвгдѓежзсијклљмнњопрстќуфхцчџш]+$/;
    return regex.test(name) && regex.test(surname);
}

function phoneCheck(phone){
    const phonePattern = /^07\d\d{3}\d{3}$/;
    if (!phonePattern.test(phone)) {
        return false;
    }
    else {
        const extracted=phone.replace(/-/g,"");
        return extracted.length === 9;
    }
}
function ageCheck(dateOfBirth){
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 18;
}
function passwordCheck(password){
    const regex = /^[A-Za-z0-9!@#$%^&*]{8,}$/;
    return regex.test(password);
}
export async function verificationCheck(userData,condition) {
    if (!usernameCheck(userData.username)) {
        alert("Invalid username");
        return false;
    }
    if (!nameSurnameCheck(userData.name, userData.surname)) {
        alert("Invalid name and surname");
        return false;
    }
    if (!phoneCheck(userData.phone)) {
        alert("Invalid format of phone");
        return false;
    }
    if (!ageCheck(userData.age)) {
        alert("Under 18");
        return false;
    }

    if (typeof userData.password !== 'undefined') {
        if (!passwordCheck(userData.password)) {
            alert("Stronger password");
            return false;
        }
    }
    if(condition!==false){
        const response = await fetch(`/api/users/checkDifferentUser`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    }
    return true;
}