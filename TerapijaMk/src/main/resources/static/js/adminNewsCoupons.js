const newsList = document.getElementById('news-list');
const newsForm = document.getElementById('news-form');
const couponsList = document.getElementById('coupons-list');
const couponsForm = document.getElementById('coupons-form');

let selectedImage;
let questionable;
let helper;

let pageType;
document.addEventListener('DOMContentLoaded',function (){
    pageType = document.body.getAttribute('data-page');
    if(pageType==='events'){

        const openPopupButton = document.getElementById('open-popup');
        const imagePopup = document.getElementById('image-popup');
        const overlay = document.getElementById('overlay');
        const imageInput = document.getElementById('image-url');
        const imagePreview = document.getElementById('image-preview');
        const saveButton = document.getElementById('save-button');
        const cancelButton = document.getElementById('cancel-button');


        openPopupButton.addEventListener('click', (e) => {
            e.preventDefault();
            imagePopup.style.display = 'block';
            overlay.style.display = 'block';
        });

        imageInput.addEventListener('change', (event) => {
            event.preventDefault();
            selectedImage=null;
            questionable=null;
            const file = event.target.files[0];
            questionable=file;
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.style.display='inline';
                    imagePreview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: auto;">`;
                    selectedImage =e.target.result ;

                    console.log(selectedImage);
                    saveButton.style.display = 'inline';
                };
                reader.readAsDataURL(questionable);
            }
        });

        saveButton.addEventListener('click', () => {
            if(selectedImage) {
                    let temp= document.getElementById('main-image');
                    temp.innerHTML=`<img src="${selectedImage}" style="width: 20%; height: 20%;">`;
                    closePopup();
                }
            else{
                console.log('No image file selected');
            }


        });

        cancelButton.addEventListener('click', ()=>{
            closePopup();

        });

        function closePopup() {
            imagePopup.style.display = 'none';
            overlay.style.display = 'none';
            imageInput.value = '';
            imagePreview.innerHTML = '';
        }
    }
});

function elementCreation(ItemData){
    const newItem = document.createElement('div');
    newItem.classList.add('news-item');
    newItem.setAttribute('data-id', ItemData.id);
    if(pageType==='events'){
        newItem.innerHTML = `
                <h3>${ItemData.title}</h3>
                <p>${ItemData.text}</p> 
                ${ItemData.imgSrc ? `<img src="${ItemData.imgSrc}" style="width: 50%; height: auto;" data-attribute="${ItemData.imgSrc}">` : ''}`
    }
    else{
        newItem.innerHTML = `
                <h3>${ItemData.title}</h3>
                <p>${ItemData.code}</p>
                 <div>${ItemData.description}</div>`
    }
    newItem.innerHTML+=`<button onclick="edit(this)">Edit</button>
                <button onclick="deleteBoth(this)">Delete</button>`
    return newItem;
}
function eventsRetrieval(){
    const url = pageType === 'events' ? `/api/news/getAllEvents` : `/api/coupons/getAllCoupons`;
    fetch(url,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch news.');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(ItemData => {
                let newItem=elementCreation(ItemData);
                pageType === 'events' ? newsList.appendChild(newItem) : couponsList.appendChild(newItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to load news.');
        });
}

window.onload=function(){
    eventsRetrieval();
}
function clearData(){
    if(pageType==='events'){
        document.getElementById('text').value = '';
    }
    else if(pageType==='coupons'){
        let temp1=document.getElementById('code');
        temp1.value = '';
        temp1.removeAttribute('data-initial');
        let temp2=document.getElementById('description');
        temp2.value = '';
        temp2.removeAttribute('data-initial');
    }
       let temp3=document.getElementById('title');
       temp3.value = '';
    temp3.removeAttribute('data-initial');
}
function showForm() {
    if(pageType==='events')
    document.getElementById("main-image").innerHTML='';
    pageType === 'events' ? newsForm.style.display = 'flex' : couponsForm.style.display='flex';
}

function hideForm() {
    pageType === 'events' ? newsForm.style.display = 'none' : couponsForm.style.display='none';
    clearData();
    selectedImage = null;
    questionable=null;
}

function submitForm() {
    let param1,param2,param3;
    param1 = document.getElementById('title').value;

    if(pageType==='events'){
        param2 = document.getElementById('text').value;
        param3 = selectedImage;
    }
    else if(pageType==='coupons'){
        param2 = document.getElementById('code').value;
        param3 = document.getElementById('description').value;
    }
    if (param1 && param2) {
        let newsData;
        if (pageType === 'events') {
            newsData = {
                title: param1,
                text: param2,
                imgSrc: param3
            };
        } else {
            newsData = {
                title: param1,
                code: param2,
                description: param3
            };
        }
        let initialTitle = document.getElementById('title').getAttribute('data-initial');
        console.log(initialTitle);

        if(initialTitle!==null){
            let initialParam2,initialParam3;
            if(pageType==='events'){
                initialParam2=document.getElementById("text").getAttribute('data-initial');
                initialParam3 = document.getElementsByTagName('img')[0].getAttribute('data-attribute');
            }
            else if(pageType==='coupons'){
                initialParam2 = document.getElementById('code').getAttribute('data-initial');
                initialParam3=document.getElementById('description').getAttribute('data-initial');
            }
            clearData();
            if (initialTitle !== param1 || initialParam2 !== param2 || initialParam3 !== param3) {
                console.log('Changes detected! Submitting the form.');
            } else {
                hideForm();
                return;
            }

            const url = pageType === 'events' ? `/api/news/editEvent?identifier=${initialTitle}` : `/api/coupons/editCoupon?identifier=${initialTitle}`;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newsData)
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log("Successfully edited");
                hideForm();
                if (pageType === 'events') {
                    newsList.innerHTML = '';
                } else {
                    couponsList.innerHTML = '';
                }
                eventsRetrieval();
            }).catch(error => {
                console.error('Error occurred');
            });

            return;
        }
        const url = pageType === 'events' ? `/api/news/createEvent` : `/api/coupons/createCoupon`;
        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newsData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update news.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Data updated:', data);
                let newItem = elementCreation(data);
                if (pageType === 'events') {
                    newsList.appendChild(newItem);
                } else {
                    couponsList.appendChild(newItem);
                }
                document.getElementById('form').reset();
                hideForm();
            })
            .catch(error => {
                console.error('Error during submission:', error);
                alert('Failed to save the news/coupon. Please try again.');

            });
        clearData();
    }
    else
    {
        alert('Missing fields');
    }
}

function deleteBoth(button) {

    let temp=button.parentElement;
    let value=temp.getAttribute('data-id');
    const url = pageType === 'events' ? `/api/news/deleteEvent?userId=${value}` : `/api/coupons/deleteCoupon?userId=${value}`;
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(r  => {
        if(r.ok){
            console.log('Element deleted successfully');
        }
        else{
            console.error('Failed to delete element');
        }
    })
        .catch(error => {
            console.log("error deleting");
        });

    const newItem = button.parentElement;
    pageType === 'events' ? newsList.removeChild(newItem) : couponsList.removeChild(newItem);

}

function edit(button) {
    showForm();
    const newsItem = button.parentElement;
    const param1 = newsItem.querySelector('h3').textContent;
    const param2 = newsItem.querySelector('p').textContent;

    if(pageType==='events'){
        document.getElementById('text').value = param2;
        let importantValue=newsItem.querySelector('img').getAttribute("data-attribute");
        selectedImage=importantValue;
        document.getElementById('main-image').innerHTML=`<img src="${importantValue}" style="width: 20%; height: 20%;">`;
    }
    else if(pageType==='coupons'){
        const description=newsItem.querySelector('div').textContent;
        document.getElementById('code').value = param2;
        document.getElementById('code').setAttribute('data-initial',param2);
        document.getElementById('description').value = description;
        document.getElementById('description').setAttribute('data-initial',description);
    }
    document.getElementById('title').value = param1;
    document.getElementById('title').setAttribute('data-initial', param1);

}

