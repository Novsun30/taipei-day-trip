import { showLogInPanel } from "./modules/UserPanel.js";
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
    logInSignUp.textContent = "會員中心";
    logInSignUp.removeEventListener("click", showLogInPanel);
    logInSignUp.addEventListener("click", toMemberPage);
   }
}
async function logOut(){
    await fetch("/api/user/auth",{method: "DELETE"}).then(res=>res).then(data=>data);
    logInSignUp.textContent = "登入/註冊";
    logInSignUp.removeEventListener("click", toMemberPage);
    logInSignUp.addEventListener("click", showLogInPanel);
    location.reload();
}
function toMemberPage(){
    location.href = "/member"
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