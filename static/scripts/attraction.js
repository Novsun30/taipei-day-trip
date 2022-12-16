showAttraction();
const radioDay = document.querySelector("input.radio-day");
const radioNight = document.querySelector("input.radio-night");
radioDay.addEventListener("change", ()=>{
    if(radioDay.checked){
    const priceDetail = document.querySelector("p.price-detail");
    priceDetail.innerText = "新台幣 2000 元";
    }
})
radioNight.addEventListener("change", ()=>{
if(radioNight.checked){
    const priceDetail = document.querySelector("p.price-detail");
    priceDetail.innerText = "新台幣 2500 元";
    }
})
let showingImgIndex = 0;
const leftArrow = document.querySelector("button.left-arrow");
const rightArrow = document.querySelector("button.right-arrow");
rightArrow.addEventListener("click", nextImg);
leftArrow.addEventListener("click", previousImg);
const bookingSubmitButton = document.querySelector("button.booking-submit");
bookingSubmitButton.addEventListener("click", bookingSubmit);

async function fetchData(src){
  return await fetch(src).then(response=>response.json()).then(data=>data);
}

async function showAttraction(){
    const url = document.URL;
    const regex = /(?<=attraction\/)\d+/;
    const id = url.match(regex)[0];
    const src = `/api/attraction/${id}`;
    let data = await fetchData(src);
    if(data["error"] == true){
        document.body.remove()
    }
    data = data["data"];
    const images = data["images"];
    const imagesDiv = document.querySelector("div.images");
    const newImg = document.createElement("img");
    newImg.src = images[0];
    newImg.classList.add("attraction-img");
    imagesDiv.appendChild(newImg);

    const dotContainer = document.querySelector("div.dot-container");
    const newDot = document.createElement("div");
    const newDotIndicator = document.createElement("div");
    newDot.classList.add("dot")
    newDot.classList.add("dot-0");
    newDotIndicator.classList.add("dot-indicator");
    dotContainer.appendChild(newDot);
    newDot.appendChild(newDotIndicator);
    newDot.addEventListener("click", imgSelector);

    for(let i = 1; i < images.length; i++){
        const newMoreImg = document.createElement("img");
        newMoreImg.src = images[i];
        newMoreImg.classList.add("attraction-img");
        newMoreImg.style.display = "none";
        imagesDiv.appendChild(newMoreImg);

        const dotContainer = document.querySelector("div.dot-container");
        const newDot = document.createElement("div");
        const newDotIndicator = document.createElement("div");
        newDot.classList.add("dot");
        newDot.classList.add(`dot-${i}`);
        newDotIndicator.classList.add("dot-indicator");
        newDotIndicator.style.display = "none";
        dotContainer.appendChild(newDot);
        newDot.appendChild(newDotIndicator);
        newDot.addEventListener("click", imgSelector);
    }

    const name = data["name"];
    const nameDiv = document.querySelector("div.name");
    const newName = document.createElement("h3");
    newName.classList.add("bold");
    newName.innerText = name;
    nameDiv.appendChild(newName);

    const category = data["category"];
    const mrt = data["mrt"];
    const categoryMrtDiv = document.querySelector("div.category-mrt");
    const newCategoryMrt = document.createElement("p");
    newCategoryMrt.classList.add("body-med");
    newCategoryMrt.innerText = `${category} at ${mrt}`;
    categoryMrtDiv.appendChild(newCategoryMrt)

    const description = data["description"];
    const descriptionDiv = document.querySelector("div.description");
    const newDescription = document.createElement("p");
    newDescription.classList.add("content");
    newDescription.innerText = description;
    descriptionDiv.appendChild(newDescription);

    const address = data["address"];
    const addressDiv = document.querySelector("div.address");
    const newAddress = document.createElement("p");
    newAddress.classList.add("content");
    newAddress.innerText = address;
    addressDiv.appendChild(newAddress);

    const transport = data["transport"];
    const transportDiv = document.querySelector("div.transport");
    const newTransport = document.createElement("p");
    newTransport.classList.add("content");
    newTransport.innerText = transport;
    transportDiv.appendChild(newTransport);
}

function nextImg(){
    const images = document.querySelectorAll("img.attraction-img");
    const dotIndicator = document.querySelectorAll("div.dot-indicator");
    images[showingImgIndex].style.display = "none";
    dotIndicator[showingImgIndex].style.display = "none";
    if(images[showingImgIndex+1] == undefined){
        showingImgIndex = 0;
        images[showingImgIndex].style.display = "block";
        dotIndicator[showingImgIndex].style.display = "block";
        return;
    }
    showingImgIndex = showingImgIndex+1;
    images[showingImgIndex].style.display = "block";
    dotIndicator[showingImgIndex].style.display = "block";
}

function previousImg(){
    const images = document.querySelectorAll("img.attraction-img");
    const dotIndicator = document.querySelectorAll("div.dot-indicator");
    images[showingImgIndex].style.display = "none"
    dotIndicator[showingImgIndex].style.display = "none";
    if(images[showingImgIndex-1] == undefined){
        showingImgIndex = images.length-1;
        images[showingImgIndex].style.display = "block";
        dotIndicator[showingImgIndex].style.display = "block";
        return;
    }
    showingImgIndex = showingImgIndex-1;
    images[showingImgIndex].style.display = "block";
    dotIndicator[showingImgIndex].style.display = "block";
}

function imgSelector(e){
    const regex = /\d+/;
    let indexIndicator =  e.target.className.match(regex);
    if(indexIndicator == null){
        return;
    }
    indexIndicator = indexIndicator[0];
    if(indexIndicator == showingImgIndex){
        return;
    }
    const images = document.querySelectorAll("img.attraction-img");
    const dotIndicator = document.querySelectorAll("div.dot-indicator");
    images[showingImgIndex].style.display = "none";
    dotIndicator[showingImgIndex].style.display = "none";

    showingImgIndex = indexIndicator;
    images[showingImgIndex].style.display = "block";
    dotIndicator[showingImgIndex].style.display = "block";
}

async function bookingSubmit(){
    const bookingErrorMessage = document.querySelector("p.booking-error-message");
    if(bookingErrorMessage != null){
        bookingErrorMessage.remove();
    }
    const date = document.querySelector("input.date-select").value;
    if (date == ""){
        const newErrorMessage = document.createElement("p");
        const bookingDiv = document.querySelector("div.booking");
        newErrorMessage.textContent = "請輸入日期！";
        newErrorMessage.classList.add("booking-error-message");
        bookingDiv.appendChild(newErrorMessage);
        return;
    }
    const newDate = new Date();
    const currentDate = `${newDate.getFullYear()}-${newDate.getMonth()+1}-${newDate.getDate()}`
    if(date <= currentDate){
        const newErrorMessage = document.createElement("p");
        const bookingDiv = document.querySelector("div.booking");
        newErrorMessage.textContent = "只能預約明天(含)以後的日期！";
        newErrorMessage.classList.add("booking-error-message");
        bookingDiv.appendChild(newErrorMessage);
        return;
    }
    let timeInput = document.querySelector("input[name='time']:checked").value;
    timeInput = timeInput.split(",");
    const time = timeInput[0];
    const price = Number(timeInput[1]);
    const regex = /(?<=attraction\/)\d+/;
    const id = Math.abs(document.URL.match(regex)[0]) ;
    console.log(id, date, time, price);
    const BookingData = {
        "attractionId": id,
        "date": date,
        "time": time,
        "price": price
    }
    const response = await fetch("/api/booking",{
        method : "POST",
        headers : {"content-type": "application/json"},
        body : JSON.stringify(BookingData)
    })
    const bookingResult = await response.json();
    if(bookingResult["error"] == true){
        const newErrorMessage = document.createElement("p");
        const bookingDiv = document.querySelector("div.booking");
        newErrorMessage.textContent = "預約失敗！";
        if(bookingResult.message == "該日期已預訂"){
            newErrorMessage.textContent = "該日期已預訂過了！"
        }
        newErrorMessage.classList.add("booking-error-message");
        bookingDiv.appendChild(newErrorMessage);
        return;
    }
    window.location.href = "/booking"
}