import { verificationCheck } from "./authentication-shared.js";
function toggleForm(formId, show) {
        const form = document.getElementById(formId);
        form.style.display = show ? 'flex' : 'none';
        document.body.style.overflow = show ? 'hidden' : 'auto';
    }

function updateUIBasedOnRole(role) {
    if (role === 'ADMIN') {
        window.location.href = 'admin.html';

    } else if (role === 'USER') {
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('userSection').style.display = 'block';
    }

}

function setupFormHandlers(buttonId, formId, closeBtnId) {
    document.getElementById(buttonId).addEventListener('click', function() {
        toggleForm(formId, true);
    });

    document.getElementById(closeBtnId).addEventListener('click', function() {
        toggleForm(formId, false);
    });
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById(formId)) {
            toggleForm(formId, false);
        }
    });
}

document.getElementById('signInForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    let res = await verificationCheck(data);
    if (!res) {
        return;
    }
    console.log(data);
    fetch('/api/users/signIn', {
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
            else{
                alert("Sign in successfull! Now log in!")
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
     const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    alert(errorData.message || 'Unknown error');
                    throw new Error(errorData.message || 'Unknown error');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Parsed data:', data);
            if (data.success) {
                updateUIBasedOnRole(data.userRole);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            toggleForm('loginForm', false);
        });
});

setupFormHandlers('loginBtn', 'loginForm', 'closeBtn');
setupFormHandlers('signInBtn', 'signInForm', 'closeSignInBtn');
