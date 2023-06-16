logInChecker();
showBookingData();

async function logInChecker(){
    const response = await fetch("/api/user/auth");
    const data = await response.json();
    if(data["data"] === null){
        location.href = "/"
    }
}

async function LogInAuthentication(){
    const response = await fetch("/api/user/auth");
    const data = await response.json();
    if(data["data"] == null){
         window.location.href = "/";
    }
    return data;
}
async function getBookingData(){
    const response = await fetch("/api/booking");
    const data = await response.json();
    return data;
}
async function showBookingData(){
    let data = await getBookingData();
    let memberData = await LogInAuthentication();
    const memberName = memberData["data"]["name"];
    const memberEmail = memberData["data"]["email"];
    const headline = document.querySelector("p.headline");
    const nameInput = document.querySelector("input.name-input");
    const emailInput = document.querySelector("input.email-input");
    headline.textContent = `您好，${memberName}，待預訂的行程如下：`;
    if(data["data"] == null){
        nullBookingData();
        return;
    }
    nameInput.value = memberName;
    emailInput.value = memberEmail;
    for(let i = 0; i < data["data"].length; i++){
        const bookingDataContainer = document.querySelector("section.booking-data-container");
        const newBookingDataDiv = document.createElement("div");
        newBookingDataDiv.classList.add("booking-data");
        bookingDataContainer.appendChild(newBookingDataDiv);

        const newAttractionImage = document.createElement("img");
        const newAttractionDataDiv = document.createElement("div");
        newAttractionImage.src = data["data"][i]["attraction"]["image"];
        newAttractionImage.classList.add("attraction-image");
        newAttractionDataDiv.classList.add("attraction-data");
        newBookingDataDiv.appendChild(newAttractionImage);
        newBookingDataDiv.appendChild(newAttractionDataDiv);

        const newAttractionName = document.createElement("p");
        newAttractionName.classList.add("body-bold", "attraction-name");
        const attractionName = data["data"][i]["attraction"]["name"];
        newAttractionName.textContent = `台北一日遊：${attractionName}`;
        newAttractionDataDiv.appendChild(newAttractionName);
        for(let j = 0; j < 4 ; j ++){
            const newAttractionContentDiv = document.createElement("div");
            const newTitle = document.createElement("p");
            const newContent = document.createElement("p");
            newTitle.classList.add("body-bold");
            newContent.classList.add("body-med");
            if(j == 0){
                newTitle.textContent = "日期：";
                newContent.textContent = data["data"][i]["date"];
                newContent.classList.add("booking-date");
            }
            if(j == 1){
                let time = data["data"][i]["time"];
                if(time == "morning"){
                    time = "早上 9 點到下午 4 點";
                }
                if(time == "afternoon"){
                    time = "下午 1 點到晚上 9 點";
                }
                newTitle.textContent = "時間：";
                newContent.textContent = time;
            }
            if(j == 2){
                const price = data["data"][i]["price"]
                newTitle.textContent = "費用：";
                newContent.textContent = `新台幣 ${price} 元`;
            }
            if(j == 3){
                newTitle.textContent = "地點：";
                newContent.textContent = data["data"][i]["attraction"]["address"];
            }
            newAttractionDataDiv.appendChild(newAttractionContentDiv);
            newAttractionContentDiv.appendChild(newTitle);
            newAttractionContentDiv.appendChild(newContent);
        }
        const newTrashCanImage = document.createElement("img");
        newTrashCanImage.classList.add("trash-can");
        newTrashCanImage.src = "static/images/icon_delete.png";
        newTrashCanImage.addEventListener("click", deleteBookingData.bind(newBookingDataDiv))
        newBookingDataDiv.appendChild(newTrashCanImage);
    }
    const totalPriceContent = document.querySelector("p.total-price");
    const totlaPrice = data["total_price"];
    totalPriceContent.textContent = `總價：新台幣 ${totlaPrice} 元`;
}
function nullBookingData(){
    const allHr = document.querySelectorAll("hr");
    const contactData = document.querySelector("section.contact-data");
    const creditCardData = document.querySelector("section.credit-card-data");
    const paymentDiv = document.querySelector("div.payment");
    const bookingDataContainer = document.querySelector("section.booking-data-container");
    bookingDataContainer.remove();
    contactData.remove();
    creditCardData.remove();
    paymentDiv.remove();
    for(let i = allHr.length-1;i != -1; i--){
        allHr[i].remove();
    }
    const main = document.querySelector("main");
    const newBookingMessage = document.createElement("p");
    newBookingMessage.classList.add("body-med", "booking-message");
    newBookingMessage.textContent = "目前沒有任何待預訂的行程"
    main.appendChild(newBookingMessage);

    const body = document.querySelector("body");
    const footer = document.querySelector("footer");
    body.style.height = "100vh";
    footer.style.flexGrow = "1";
    footer.style.alignItems = "flex-start";
    footer.style.paddingTop = "45px"
}
async function deleteBookingData(){
    const bookingDate = this.children[1].children[1].children[1].textContent;    
    const response = await fetch("/api/booking",{
        method : "DELETE",
        headers : {"content-type": "application/json"},
        body: JSON.stringify({"date": bookingDate})
    })
    const result = await response.json();
    if(result["error"] == true){
        const newErrorMessage = document.createElement("p");
        newErrorMessage.classList.add("delete-error-message");
        newErrorMessage.textContent = "移除失敗";
        this.appendChild(newErrorMessage);
        return;
    }
    this.remove();
    const bookingData = document.querySelector("div.booking-data");
    if(bookingData == null){
        nullBookingData();
    }
}