TPDirect.setupSDK(126910, "app_fmZcvpG97W2iP1v8FoEE6HH5SDls2qDEdzT4v5rJcVkMtWlcerICG0mVrbdY", "sandbox")
// Display ccv field
const fields = {
    number: {
        // css selector
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: 'ccv'
    }
}
TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            
            'color': 'gray',
            "font-size": "16px",

        },
        // Styling ccv field
        'input.ccv': {
            // 'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            // 'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            // 'font-size': '16px'
        },
        // style focus state
        ':focus': {
            // 'color': 'black'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    // isMaskCreditCardNumber: true,
    // maskCreditCardNumberRange: {
    //     beginIndex: 6,
    //     endIndex: 11
    // }
})
TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        // submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        // submitButton.setAttribute('disabled', true)
    }

    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay','unknown']
    if (update.cardType === 'visa') {
        // Handle card type visa.
    }

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.number === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }

    if (update.status.expiry === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.expiry === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }

    if (update.status.ccv === 2) {
        // setNumberFormGroupToError()
    } else if (update.status.ccv === 0) {
        // setNumberFormGroupToSuccess()
    } else {
        // setNumberFormGroupToNormal()
    }
})

const submitButton = document.querySelector("button.payment-submit");
submitButton.addEventListener("click", onSubmit);
let isLoading = false;

// call TPDirect.card.getPrime when user submit form to get tappay prime
// $('form').on('submit', onSubmit)

function onSubmit(event) {
    const authResult = inputAuthentication();
    if(authResult === false){
        return;
    }
    if(isLoading){
        return;
    }
    isLoading = true
    event.preventDefault()

    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        const number = tappayStatus.status.number;
        const expiry = tappayStatus.status.expiry;
        const ccv = tappayStatus.status.ccv;
        if(number === 1){
            paymetErrorMessage("請輸入卡片號碼");
            return;
        }
        if(number === 2){
            paymetErrorMessage("卡片號碼錯誤");
            return;
        }
        if(expiry === 1){
            paymetErrorMessage("請輸入卡片有效日期");
            return;
        }
        if(expiry === 2){
            paymetErrorMessage("卡片有效日期錯誤");
            return;
        }
        if(ccv === 1){
            paymetErrorMessage("請輸入卡片安全碼");
            return;
        }
        if(ccv === 2){
            paymetErrorMessage("卡片安全碼錯誤");
            return;
        }

        return
    }

    // Get prime
    TPDirect.card.getPrime(async (result) => {

        if (result.status !== 0) {
            return
        }
        
        await submitData(result.card.prime);
        isLoading = false;
        // send prime to your server, to pay with Pay by Prime API .
    })
}

async function submitData(prime){
    const name = document.querySelector("input.name-input").value.trim()
    const email = document.querySelector("input.email-input").value.trim()
    const phone = document.querySelector("input.number-input").value.trim()

    let result = {
        "prime": prime,
        "order": {
            "total_price": "",
            "trips": []
        },
        "contact":{
            "name": name,
            "email": email,
            "phone": phone
        }
    }

    const bookingResponse = await fetch("/api/booking")
    const bookingData = await bookingResponse.json()
    for(let i = 0; i < bookingData["data"].length; i++){
        const data = bookingData["data"];
        let trips = {
            "attraction":{
                "id": data[i]["attraction"]["id"],
                "name": data[i]["attraction"]["name"],
                "address": data[i]["attraction"]["address"],
                "image": data[i]["attraction"]["image"]               
            },
            "date": data[i]["date"],
            "time": data[i]["time"],
            "price": data[i]["price"]
        };
        result["order"]["trips"].push(trips);
    }
    result["order"]["total_price"] = bookingData["total_price"];
   
    const response = await fetch("/api/orders", {
        headers: {"content-type": "application/json"},
        method: "POST",
        body: JSON.stringify(result)
    })
    const data = await response.json();
    if(data["error"] === true){
        paymetErrorMessage(data["message"]);
    }

    window.location.href = `/thankyou?number=${data["data"]["number"]}`
}

function inputAuthentication(){
    const errorMessage = document.querySelector("p.payment-error");
    if(errorMessage != null){
        errorMessage.remove();
    }
    const newDate = new Date();
    const currentDate = `${newDate.getFullYear()}-${newDate.getMonth()+1}-${newDate.getDate()}`;
    const allBookingDate = document.querySelectorAll("p.booking-date");
    for(let i = 0; i < allBookingDate.length; i++){
        if(currentDate >= allBookingDate[i].textContent){
            paymetErrorMessage("只能預定明天以後的行程，請刪除過期行程");
            return false;
        }
    }
    const nameInput = document.querySelector("input.name-input").value.trim();
    const emailInput = document.querySelector("input.email-input").value.trim();
    const numberInput = document.querySelector("input.number-input").value.trim();
    if(nameInput === ""){
        paymetErrorMessage("請輸入姓名");
        return false
    }
    if(emailInput === ""){
        paymetErrorMessage("請輸入信箱");
        return false
    }
    if(numberInput === ""){
        paymetErrorMessage("請輸入電話");
        return false
    }

    return true;
}

function paymetErrorMessage(message){
    const paymentDiv = document.querySelector("div.payment");
    const newPaymentSubmitError = document.createElement("p");
    newPaymentSubmitError.classList.add("payment-error");
    newPaymentSubmitError.textContent = message;
    paymentDiv.appendChild(newPaymentSubmitError);
}