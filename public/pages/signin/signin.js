import { componentLoader } from '/global/componentLoader.js';
import { renderHeader } from "/component/header/header.js";
import { authApi } from '/api/auth/authApi.js';

let emailCheck = false;
let passwordCheck = false;

let email;
let emailHelperText;

let password;
let passwordHelperText;

let signinBtn;

const emailPattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;

document.addEventListener("DOMContentLoaded", async () => {

  await componentLoader("header","/component/header/header", true, true, null);
  renderHeader({ back: false, profile: false });

  await componentLoader("email", "/component/input-form/input-form", true, false,{
    id: "email",
    label: "이메일*",
    type: "email",
    placeholder: "이메일을 입력하세요.",
    helper: "*이메일을 입력하세요.",
  });
  email = document.querySelector("#email input");
  emailHelperText = emailHelperText = document.querySelector("#email .helper-text");
  

  await componentLoader("password", "/component/input-form/input-form", true, false,{
    id: "password",
    label: "비밀번호*",
    type: "password",
    placeholder: "비밀번호를 입력하세요.",
    helper: "*비밀번호를 입력하세요.",
  });
  password = document.querySelector("#password input");
  passwordHelperText = document.querySelector("#password .helper-text");

  await componentLoader("signin-button", "/component/button/main-button/main-button", true, false, {
    text: "로그인"
  });
  signinBtn = document.querySelector("#signin-button button");

  await componentLoader("signup-button","/component/button/text-button/text-button", true, false, {
    text: "회원가입"
  });
  

  addEventListenerToEmail();
  addEventListenerToPassword();
  addEventListenerTpSignInButton();
  addEventListenerToSignUpButton();

});

function addEventListenerToEmail(){

  email.addEventListener("input", () => {
 
    if(!email.value || email.value.trim().length === 0){
      emailHelperText.textContent = "이메일을 입력하세요.";
      emailCheck = false;
      return;
    }else if(!emailPattern.test(email.value)){
      emailHelperText.textContent = "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
      emailCheck = false;
      return;
    }else{
      emailCheck = true;
      emailHelperText.textContent = "";
    }

    updateSigninButtonState();
  });
}

function addEventListenerToPassword(){
  password.addEventListener("input", () => { 

    if(!password.value || password.value.trim().length === 0) {
      passwordCheck = false;
      passwordHelperText.textContent = "*비밀번호를 입력하세요.";
    }else if(!passwordPattern.test(password.value)){
      passwordHelperText.textContent = "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야합니다.";
      passwordCheck = false;
    }else{
      passwordCheck = true;
      passwordHelperText.textContent = "";
      
    }
    updateSigninButtonState();
  });
}


function addEventListenerTpSignInButton(){
  signinBtn.disabled = true;

  signinBtn.addEventListener("click", async () => {
  
    if (signinBtn.disabled) return;

    const response = await authApi.login({ email: email.value, password: password.value });
    if (!response.ok) {
      if(response.status === 404){
        emailHelperText.textContent = "로그인 정보를 찾을 수 없습니다.";
      }else if(response.status === 400){
        passwordHelperText.textContent = "잘못된 비밀번호를 입력했습니다.";
      }else{
        alert("로그인을 실패했습니다.");
      }
      return;
    }

    const result = await response.json();
    localStorage.setItem("userId", result.userId);
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken);
    window.location.replace("/pages/home/home.html");   
  });
}

function addEventListenerToSignUpButton(){
  const signupBtn = document.getElementById("signup-button");
  signupBtn.addEventListener("click", () => {
    window.location.href = "/pages/signup/signup.html";
  });
}

function updateSigninButtonState() {

  if (emailCheck && passwordCheck) {
    signinBtn.disabled = false;
  } else {
    signinBtn.disabled = true;
  }
}