logInChecker();
renderPage();
previewUploadImg();
const logOutButton = document.querySelector("button.log-out");
logOutButton.addEventListener("click",logOut)

async function logInChecker(){
    const response = await fetch("/api/user/auth");
    const data = await response.json();
    if(data["data"] === null){
        location.href = "/"
    }
}

function renderPage(){
    const memberId = renderMemberData();
    renderOrderHistory();
}

async function logOut(){
    await fetch("/api/user/auth",{method: "DELETE"});
    location.href = "/";
}

async function fetchMemberData(){
    const response = await fetch("/api/user/auth");
    const data = await response.json();
    return data;
}

async function fetchOrderList(){
    const response = await fetch("/api/orders");
    const data = await response.json();
    return data;
}

async function fetchOrder(orderNumber){
    const response = await fetch(`/api/order/${orderNumber}`);
    const data = await response.json();
    return data;
}

async function renderMemberData(){
    const data = await fetchMemberData();
    const nameContent = document.querySelector("p.member-name");
    const emailContent = document.querySelector("p.member-email");
    const registerDateContent = document.querySelector("p.member-register-date");
    nameContent.textContent = data["data"]["name"];
    emailContent.textContent = data["data"]["email"];
    registerDateContent.textContent = data["data"]["registerDate"];
    return data["data"]["id"];
}
 
async function renderOrderHistory(){
    let data = await fetchOrderList();
    data = data["data"];
    for(let i = 0; i < data.length; i++){
        const orderListDiv = document.querySelector("div.order-list")
        const newOrderDiv = document.createElement("div");
        newOrderDiv.classList.add("order");
        orderListDiv.appendChild(newOrderDiv);

        const newOrderTopDiv = document.createElement("div");
        newOrderTopDiv.classList.add("order-top");
        newOrderDiv.appendChild(newOrderTopDiv);

        const newOrderNumberTitle = document.createElement("p");
        newOrderNumberTitle.classList.add("body-bold", "order-number-title");
        newOrderNumberTitle.textContent = "訂單編號";
        newOrderTopDiv.appendChild(newOrderNumberTitle);

        const newCreateDateTitle = document.createElement("p");
        newCreateDateTitle.classList.add("body-bold", "create-date-title");
        newCreateDateTitle.textContent = "建立日期"
        newOrderTopDiv.appendChild(newCreateDateTitle);

        const newTotalPriceTitle = document.createElement("p");
        newTotalPriceTitle.classList.add("body-bold", "total-price-title");
        newTotalPriceTitle.textContent = "總金額";
        newOrderTopDiv.appendChild(newTotalPriceTitle);
    
        const newStatusTitle = document.createElement("p");
        newStatusTitle.classList.add("body-bold", "status-title");
        newStatusTitle.textContent = "付款狀態";
        newOrderTopDiv.appendChild(newStatusTitle);

        const newArrowImg = document.createElement("img");
        newArrowImg.src = "static/images/icon_down_arrow.png";
        newOrderTopDiv.appendChild(newArrowImg);
        newArrowImg.addEventListener("click", showOrderBottom.bind(newOrderDiv));

        const newOrderNumber = document.createElement("p");
        newOrderNumber.classList.add("body-med", "order-number");
        newOrderNumber.textContent = data[i]["order_number"];
        newOrderTopDiv.appendChild(newOrderNumber);

        const newCreateDate = document.createElement("p");
        newCreateDate.classList.add("body-med", "create-date");
        newCreateDate.textContent = data[i]["create_time"];
        newOrderTopDiv.appendChild(newCreateDate);

        const newTotalPrice = document.createElement("p");
        newTotalPrice.classList.add("body-med", "total-price");
        newTotalPrice.textContent = data[i]["total_price"];
        newOrderTopDiv.appendChild(newTotalPrice);

        const newStatus = document.createElement("p");
        newStatus.classList.add("body-med", "status");
        newStatus.textContent = data[i]["status"];
        newOrderTopDiv.appendChild(newStatus);

        const newOrderBottomDiv = document.createElement("div");
        newOrderBottomDiv.classList.add("order-bottom");
        newOrderDiv.appendChild(newOrderBottomDiv);

        const newNameTitle = document.createElement("p");
        newNameTitle.classList.add("body-bold", "name-title");
        newNameTitle.textContent = "聯絡姓名";
        newOrderBottomDiv.appendChild(newNameTitle);

        const newPhoneTitle = document.createElement("p");
        newPhoneTitle.classList.add("body-bold", "phone-title");
        newPhoneTitle.textContent = "聯絡電話";
        newOrderBottomDiv.appendChild(newPhoneTitle);

        const newEmailTitle = document.createElement("p");
        newEmailTitle.classList.add("body-bold", "email-title");
        newEmailTitle.textContent = "聯絡信箱";
        newOrderBottomDiv.appendChild(newEmailTitle);

        const newName = document.createElement("p");
        newName.classList.add("body-med", "name");
        newName.textContent = data[i]["name"];
        newOrderBottomDiv.appendChild(newName);

        const newPhone = document.createElement("p");
        newPhone.classList.add("body-med", "phone");
        newPhone.textContent = data[i]["phone"];
        newOrderBottomDiv.appendChild(newPhone);

        const newEmail = document.createElement("p");
        newEmail.classList.add("body-med", "email");
        newEmail.textContent = data[i]["email"];
        newOrderBottomDiv.appendChild(newEmail);

        const newButton = document.createElement("button");
        newButton.classList.add("button");
        newButton.textContent = "顯示詳細行程";
        newOrderDiv.appendChild(newButton);

        newButton.addEventListener("click", showTrips.bind(newOrderDiv));
    }
}

async function showTrips(){
    if(this.nextElementSibling != null){
        if(this.nextElementSibling.style.display === "none"){
            this.nextElementSibling.style.display = "flex"
            this.children[2].textContent = "收起詳細行程"
            return;
        }
        if(this.nextElementSibling.className === "trips"){
            this.nextElementSibling.style.display = "none";
            this.children[2].textContent = "顯示詳細行程"
            return;
        }
    }
    this.children[2].textContent = "收起詳細行程"
    const order_number = this.children[0].children[5].textContent;
    let data = await fetchOrder(order_number);
    data = data["data"]["trips"];
    const newTripList = document.createElement("div");
    newTripList.classList.add("trips");
    this.insertAdjacentElement("afterend", newTripList);

    for(let i = 0; i < data.length; i++){

        const newTripDiv = document.createElement("div");
        newTripDiv.classList.add("trip");
        newTripList.appendChild(newTripDiv)
    
        const newTitleDiv = document.createElement("div");
        const newName = document.createElement("p");
        newTitleDiv.classList.add("title");
        newName.classList.add("body-bold");
        newName.textContent = data[i]["attraction"]["name"];
        newTripDiv.appendChild(newTitleDiv);
        newTitleDiv.appendChild(newName);
    
        const newContentDiv = document.createElement("div");
        newContentDiv.classList.add("content");
        newTripDiv.appendChild(newContentDiv);

        const newDateDiv = document.createElement("div");
        newDateDiv.classList.add("date");
        newContentDiv.appendChild(newDateDiv);

        const newDateTitle = document.createElement("p");
        newDateDiv.classList.add("body-bold");
        newDateTitle.textContent = "日期：";
        const newDate = document.createElement("p");
        newDate.classList.add("body-med");
        newDate.textContent = data[i]["date"];
        newDateDiv.append(newDateTitle, newDate);

        const newTimeDiv = document.createElement("div");
        newTimeDiv.classList.add("time");
        newContentDiv.appendChild(newTimeDiv);

        const newTimeTitle = document.createElement("p");
        newTimeTitle.classList.add("body-bold");
        newTimeTitle.textContent = "時間：";
        const newTime = document.createElement("p");
        newTime.classList.add("body-med");
        const time =  data[i]["time"] === "morning" ? "早上 9 點到下午 4 點" : "下午 1 點到晚上 9 點"
        newTime.textContent = time;
        newTimeDiv.append(newTimeTitle, newTime);
        
        const newPriceDiv = document.createElement("div");
        newPriceDiv.classList.add("price");
        newContentDiv.appendChild(newPriceDiv);

        const newPriceTitle = document.createElement("p");
        newPriceTitle.classList.add("body-bold");
        newPriceTitle.textContent = "費用：";
        const newPrice = document.createElement("p");
        newPrice.classList.add("body-med");
        newPrice.textContent = data[i]["price"] + " 元";
        newPriceDiv.append(newPriceTitle, newPrice);

        const newAddressDiv = document.createElement("div");
        newAddressDiv.classList.add("address");
        newContentDiv.appendChild(newAddressDiv);

        const newAddressTitle = document.createElement("p");
        newAddressTitle.classList.add("body-bold");
        newAddressTitle.textContent = "地址：";
        const newAddress = document.createElement("p");
        newAddress.classList.add("body-med");
        newAddress.textContent = data[i]["attraction"]["address"];
        newAddressDiv.append(newAddressTitle, newAddress);
    }    
}

function showOrderBottom(){
    if(this.children[1].style.display === "" || this.children[1].style.display === "none"){
        this.children[1].style.display = "grid";
        this.children[2].style.display = "block";
        return;
    }
    this.children[1].style.display = "none";
    this.children[2].style.display = "none";

    if(this.nextElementSibling.classList[0] === "trips"){
        this.nextElementSibling.style.display = "none"
    }
}

function previewUploadImg(){
    const imgUploadInput = document.querySelector("input#img-upload");
    imgUploadInput.addEventListener("change", (event)=>{
        const previewImg = document.querySelector("img.preview-img");
        const targetImg = event.target.files
        if( targetImg.length === 0){
            return
        }
        const objectUrl =  URL.createObjectURL(targetImg[0]);
        previewImg.src = objectUrl;
        const imgUploadConfirmDiv = document.querySelector("div.img-upload-confirm");
        const imgPreviewSubmit = document.querySelector("button.preview-submit");
        const imgPreviewDiv = document.querySelector("div.preview-img");
        imgPreviewDiv.style.display = "block";
        imgUploadConfirmDiv.style.display = "block";
        imgPreviewSubmit.style.display = "none";
        imgUploadConfirm(objectUrl, targetImg[0]);
    })
}
function imgUploadConfirm(objectUrl, targetImg){
    const uploadSubmit = document.querySelector("button.upload-submit");
    const uploadCancel = document.querySelector("button.upload-cancel");
    uploadSubmit.addEventListener("click", imgUploadSubmit)
    uploadSubmit.objectUrl = objectUrl;
    uploadSubmit.targetImg = targetImg;
    uploadCancel.addEventListener("click", ()=>{
        const imgUploadConfirmDiv = document.querySelector("div.img-upload-confirm");
        const imgPreviewSubmit = document.querySelector("button.preview-submit");
        const imgPreviewDiv = document.querySelector("div.preview-img");
        imgPreviewDiv.style.display = "none";
        imgUploadConfirmDiv.style.display = "none";
        imgPreviewSubmit.style.display = "block";
        URL.revokeObjectURL(objectUrl)
    })
}

async function imgUploadSubmit(event){
    const objectUrl = event.currentTarget.objectUrl;
    const targetImg = event.currentTarget.targetImg;
    const memberData = await fetchMemberData()
    let formData = new FormData();
    formData.append("profileImg", targetImg, `${memberData["data"]["name"]}.jpg`)
    console.log(formData.getAll("profileImg"))

    

    URL.revokeObjectURL(objectUrl)
}