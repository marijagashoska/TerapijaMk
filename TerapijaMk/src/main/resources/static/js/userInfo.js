const couponsFrame=document.getElementById("coupons-frame");
const newsFrame=document.getElementById("news-frame");
window.addEventListener('load',async function(){
    try{
        const response1=await fetch(`/api/coupons/getAllCoupons`);
        const response2=await fetch(`/api/news/getAllEvents`);
        if(response1.ok){
            const coupons=await response1.json();
            coupons.forEach(coupon=>{
                const couponDiv=document.createElement("div");
                couponDiv.classList.add("new-item");
                couponDiv.innerHTML=`<h3>${coupon.title}</h3><p>${coupon.code}</p><p>${coupon.description}</p>`;

                couponsFrame.appendChild(couponDiv);
            })
        }
        else{
            console.log("error with coupons")
        }
        if(response2.ok){
            const news=await response2.json();
            news.forEach(event=>{
                const eventDiv=document.createElement("div");
                eventDiv.classList.add("new-item");
                eventDiv.innerHTML=`<h3>${event.title}</h3><p>${event.text}</p>${event.imgSrc ? `<img src="${event.imgSrc}" style="width: 80%; height: auto;" data-attribute="${event.imgSrc}">` : ''}`;

                newsFrame.appendChild(eventDiv);
            })
        }
        else{
            console.log("error with news")
        }
    }
    catch(error){
        console.error("Error fetching data:", error);
    }
});