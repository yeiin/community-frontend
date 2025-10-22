import { componentLoader } from '/global/componentLoader.js';
import { renderHeader } from "/component/header/header.js";
import { memberApi } from '/api/member/memberApi.js';

const memberId = localStorage.getItem("userId");
let passwordCheck;

let password;
let passwordHelperText;
let rePassword;
let rePasswordHelperText;
let submitBtn;

document.addEventListener("DOMContentLoaded", async () => {
  
  await componentLoader("header","/component/header/header", true, true, null);
  renderHeader({ back: false, profile: true });
  
  await componentLoader("password-submit-button", "/component/button/main-button/main-button", true, false, {
    text: "수정하기"
  });

  await componentLoader("password", "/component/input-form/input-form", true, false,{
    id: "password",
    label: "비밀번호*",
    type: "password",
    placeholder: "비밀번호를 입력하세요.",
    helper: "*비밀번호를 입력하세요.",
  });
  
  await componentLoader("re-password", "/component/input-form/input-form", true, false,{
    id: "re-password",
    label: "비밀번호 확인*",
    type: "re-password",
    placeholder: "비밀번호를 한번 더 입력하세요.",
    helper: "*비밀번호를 한번 더 입력하세요.",
  });

  password = document.querySelector("#password input");
  rePassword = document.querySelector("#re-password input");
  submitBtn = document.querySelector("#password-submit-button button");
  passwordHelperText = document.querySelector("#password .helper-text");
  rePasswordHelperText = document.querySelector("#re-password .helper-text");

  addEventListenerToSubmitButton();
});

function addEventListenerToPassword(){
    
}


function addEventListenerToSubmitButton(){
    submitBtn.disabled = true;

    submitBtn.addEventListener("click", async () => {
        if(submitBtn.disabled) return;

        try{
            const response = await memberApi.patchPassword(memberId, {password: password.value});

            if(!response.ok){
                alert("비밀번호 수정 실패");
            }

            window.location.reload();

        }catch(e){
            alert("비밀번호 수정 실패");
        }
    });
}