const logInSignUp = document.querySelector("li.log-in-sign-up");
const bookingPageButton = document.querySelector("li.booking-page-button");
logInSignUp.addEventListener("click", showLogInPanel);
bookingPageButton.addEventListener("click", boookingPageRedirect);
getMemberData();
const passwordEye = document.querySelectorAll("img.password-eye");
passwordEye.forEach(element=>{element.addEventListener("click", togglePasswordDisplay)});

async function getMemberData(){
   const response = await fetch("/api/user/auth");
   let data = await response.json();
   if (data["data"] != null){
    logInSignUp.textContent = "登出系統";
    logInSignUp.removeEventListener("click", showLogInPanel);
    logInSignUp.addEventListener("click", logOut);
   }
}
function showLogInPanel(){
    const logInFilter = document.querySelector("div.log-in-filter");
    const closeButton = document.querySelectorAll("img.close-button");
    logInFilter.style.display = "flex";
    closeButton[0].addEventListener("click", ()=>{
        resetPanel();
        const logInFilter = document.querySelector("div.log-in-filter");
        logInFilter.style.display = "none";  
    });
    const logInButton = document.querySelector("button.log-in-button");
    const signUpButton = document.querySelector("button.sign-up-button");
    logInButton.addEventListener("click", submitLogIn);
    signUpButton.addEventListener("click", submitSignUp);
    togglePanel();
}
function togglePanel(){
    const toggleSignUp = document.querySelector("span.toggle-sign-up");
    const toggleLogIn = document.querySelector("span.toggle-log-in")
    const logInPanel = document.querySelector("div.log-in-panel");
    const signUpPanel = document.querySelector("div.sign-up-panel");
    toggleSignUp.addEventListener("click", ()=>{
        resetPanel();
        logInPanel.style.display = "none";
        signUpPanel.style.display = "flex";
        const closeButton = document.querySelectorAll("img.close-button");
        closeButton[1].addEventListener("click", ()=>{
            resetPanel();
            const logInFilter = document.querySelector("div.log-in-filter");
            logInFilter.style.display = "none";  
        });
    })
    toggleLogIn.addEventListener("click", ()=>{
        logInPanel.style.display = "flex";
        signUpPanel.style.display = "none";
    })
}
async function submitLogIn(){
    const logInErrorElement = document.querySelector("p.log-in-error");
    if(logInErrorElement != null){
        logInErrorElement.remove();
    }
    let email = document.querySelector("input.email-log-in").value.trim();
    let password = document.querySelector("input.password-log-in").value.trim();
    if(email == ""){
        logInErrorMessage("請輸入信箱");
        return;
    }
    if(password == ""){
        logInErrorMessage("請輸入密碼");
        return;
    }
    let result = await logInRequest(email, password);
    if (result["error"]){
        logInErrorMessage("信箱或密碼錯誤！");
        return;
    }
    location.reload();
}
function logInErrorMessage(errorMessage){
    const logInPanel = document.querySelector("div.log-in-panel");
    const newErrorMessage = document.createElement("p");
    newErrorMessage.classList.add("body-bold", "log-in-error");
    newErrorMessage.textContent = errorMessage;
    logInPanel.insertBefore(newErrorMessage, logInPanel.children[6])
}

async function logInRequest(email, password){
    const logInData = {"email": email, "password": password};
    let response = await fetch("/api/user/auth", {
        method: "PUT",
        headers:{"content-type": "application/json"},
        body: JSON.stringify(logInData)
    });
    return await response.json();
}
async function submitSignUp(){
    const signUpErrorElement = document.querySelector("p.sign-up-error");
    const signUpSuccessElement = document.querySelector("p.sign-up-success");
    if(signUpErrorElement != null){
        signUpErrorElement.remove();
    }
    if(signUpSuccessElement != null){
        signUpSuccessElement.remove();
    }
    let name = document.querySelector("input.name-sign-up").value.trim();
    let email = document.querySelector("input.email-sign-up").value.trim();
    let password = document.querySelector("input.password-sign-up").value.trim();
    name = name.replace(/\s+/gm," ");
    if(name == ""){
        signUpErrorMessage("請輸入姓名");
        return;
    }
    if(name.length>30){
        signUpErrorMessage("姓名過長");
        return;
    }
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z ]+$/;
    if(name.match(nameRegex) == null){
        signUpErrorMessage("姓名只能由中文和英文組成");
        return;
    }
    if(email == ""){
        signUpErrorMessage("請輸入信箱");
        return;
    }
    if(email.length>100){
        signUpErrorMessage("信箱過長");
        return;
    }
    const emailRegex = /^[^@]+@[^@]+$/  //need to improve email authentication
    if(email.match(emailRegex) == null){
        signUpErrorMessage("無效的信箱");
        return;
    }
    if(password == ""){
        signUpErrorMessage("請輸入密碼");
        return;
    }
    if(password.length<8){
        signUpErrorMessage("密碼至少八個字元");
        return;
    }
    if(password.length>50){
        signUpErrorMessage("密碼過長");
        return;
    }
    const passwordRegex = /[\W_]/;
    if(password.match(passwordRegex) != null){
        signUpErrorMessage("密碼只能由英文與數字組成");
        return;
    }
    let result = await signUpRequest(name, email, password);
    if (result["error"]){
        if(result["message"] == "信箱已經註冊過了"){
            signUpErrorMessage("信箱已經註冊過了！");
            return;
        }
        signUpErrorMessage("註冊失敗！");
        return;
    }
    const signUpPanel = document.querySelector("div.sign-up-panel");
    const newSuccessMessage = document.createElement("p");
    newSuccessMessage.classList.add("body-bold", "sign-up-success");
    newSuccessMessage.textContent = "註冊成功！";
    signUpPanel.insertBefore(newSuccessMessage, signUpPanel.children[7]);
}
function signUpErrorMessage(errorMessage){
    const signUpPanel = document.querySelector("div.sign-up-panel");
    const newErrorMessage = document.createElement("p");
    newErrorMessage.classList.add("body-bold", "sign-up-error");
    newErrorMessage.textContent = errorMessage;
    signUpPanel.insertBefore(newErrorMessage, signUpPanel.children[7]);
}
async function signUpRequest(name, email, password){
    const signUpData = {"name": name, "email": email, "password": password};
    let response = await fetch("/api/user", {
        method : "POST",
        headers : {"content-type": "application/json"},
        body : JSON.stringify(signUpData)
    }) 
    return await response.json();
}
function resetPanel(){
    const logInPanel = document.querySelector("div.log-in-panel");
    const signUpPanel = document.querySelector("div.sign-up-panel");
    const logInErrorElement = document.querySelector("p.log-in-error");
    const signUpErrorElement = document.querySelector("p.sign-up-error");
    const signUpSuccessElement = document.querySelector("p.sign-up-success");
    const passwordSignUp = document.querySelector("input.password-sign-up");
    const passwordLogIn = document.querySelector("input.password-log-in");
    logInPanel.style.display = "flex";
    signUpPanel.style.display = "none";
    if(logInErrorElement != null){
        logInErrorElement.remove();
    }
    if(signUpSuccessElement != null){
        signUpSuccessElement.remove();
    }
    if(signUpErrorElement != null){
        signUpErrorElement.remove();
    }   
    const LogInEmail = document.querySelector("input.email-log-in");
    const LogInPassword = document.querySelector("input.password-log-in");
    const signUpName = document.querySelector("input.name-sign-up");
    const SignUpEmail = document.querySelector("input.email-sign-up");
    const SignUpPassword = document.querySelector("input.password-sign-up");
    let arrayT = [LogInEmail, LogInPassword, signUpName, SignUpEmail, SignUpPassword]
    arrayT.forEach(element=>{element.value = ""})
    passwordSignUp.setAttribute("type", "password");
    passwordLogIn.setAttribute("type", "password");
}
async function logOut(){
    await fetch("/api/user/auth",{method: "DELETE"}).then(res=>res).then(data=>data);
    logInSignUp.textContent = "登入/註冊";
    logInSignUp.removeEventListener("click", logOut);
    logInSignUp.addEventListener("click", showLogInPanel);
    location.reload();
}
function togglePasswordDisplay(){
    const passwordSignUp = document.querySelector("input.password-sign-up");
    const passwordLogIn = document.querySelector("input.password-log-in");
    if(passwordSignUp.getAttribute("type") == "password" | passwordLogIn.getAttribute("type" == "password")){
        passwordSignUp.setAttribute("type", "text");
        passwordLogIn.setAttribute("type", "text");
        return;
    }
    passwordSignUp.setAttribute("type", "password");
    passwordLogIn.setAttribute("type", "password");
}
async function boookingPageRedirect(){
   const response = await fetch("/api/user/auth");
   const data = await response.json();
   if(data["data"] != null){
        window.location.href = "/booking"
   }
   showLogInPanel();
}