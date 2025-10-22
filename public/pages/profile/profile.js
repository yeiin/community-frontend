import { componentLoader } from '/global/componentLoader.js';
import { renderHeader } from "/component/header/header.js";
import { memberApi } from '/api/member/memberApi.js';


const memberId = localStorage.getItem("userId");

let email = document.querySelector(".email");
let nickname;
let nicknameHelperText;
let modifyBtn;
let withdrawalBtn;

let nicknameCheck = false;
let imageCheck = false;

let currentProfile = {
  id: null,
  email: "",
  nickname: "",
  imageUrl: "",
};

document.addEventListener("DOMContentLoaded", async () => {
  
  await componentLoader("header","/component/header/header", true, true, null);
  renderHeader({ back: false, profile: true });
  
  await componentLoader("modify-button", "/component/button/main-button/main-button", true, false, {
    text: "수정하기"
  });

  await componentLoader("withdrawal-button","/component/button/text-button/text-button", true, false, {
    text: "회원탈퇴"
  });

  await componentLoader("nickname", "/component/input-form/input-form", true, false,{
    id: "nickname",
    label: "닉네임*",
    type: "nickname",
    placeholder: "닉네임을 입력하세요.",
    helper: "",
  });
  nickname = document.querySelector("#nickname input");
  nicknameHelperText = document.querySelector("#nickname .helper-text");

  modifyBtn = document.querySelector("#modify-button button");
  withdrawalBtn = document.querySelector("#withdrawal-button button");

  loadProfile();
  addEventListenerToWithdrawalButton();
  addEventListenerToNickname();
  addEventListenerToModifyButton();
});

async function loadProfile() {
  try {
    const response = await memberApi.getMemberProfile(memberId);
    currentProfile = await response.json();

    email.textContent = currentProfile.email || "";
    nickname.defaultValue = currentProfile.nickname || "";

  } catch (error) {
    alert("회원 정보를 불러오지 못했습니다.");
  }
}

function addEventListenerToNickname(){

  nickname.addEventListener("input", async() => {
    try{
      if(!checkNickname()){
        nicknameCheck = false;
        changeButtonState();
        return;
      }
      nicknameCheck = true;
      changeButtonState();
      const response = await memberApi.nicknameValidation(nickname.value);
      if(response.ok){
        nicknameHelperText.textContent = "";
        nicknameCheck = true;
      }else if(response.status === 409){
        console.log("HELOO");
        nicknameHelperText.textContent = "중복된 닉네임입니다.";
        nicknameCheck = false;
      }else{
        nicknameHelperText.textContent = "잘못된 닉네임 형식입니다.";
        nicknameCheck = false;
      }
    }catch(e){
      alert("닉네임 설정 실패");
    }
  });
}

function checkNickname(){
  if(nickname.value === currentProfile.nickname){
    nicknameHelperText.textContent = "";
    return false;
  }else if(nickname.value == null){
    nicknameHelperText.textContent = "닉네임을 입력하세요.";
    return false;
  }else if( /\s/.test(nickname.value)){
    nicknameHelperText.textContent = "* 띄어쓰기를 없애주세요.";
    return false;
  }else if(nickname.value.length > 10){
    nicknameHelperText.textContent = "닉네임은 최대 10자까지 작성 가능합니다.";
    return false;
  }
  return true;
}

function changeButtonState(){
  if(nicknameCheck || imageCheck){
    modifyBtn.disabled = false;
  }else{
    modifyBtn.disabled = true;
  }
}

function addEventListenerToModifyButton(){
  modifyBtn.disabled = true;
  modifyBtn.addEventListener("click", async ()=>{
    if(modifyBtn.disabled) return;

    try{
      const response = await memberApi.patchMemberProfile(
        memberId, 
        {nickname: nickname.value, imageUrl: null });

      if(!response.ok){
        alert("프로필 수정 실패");
      }
      window.location.reload();

    }catch(e){
      alert("프로필 수정 실패");
    }
  });

}

function addEventListenerToWithdrawalButton(){
  withdrawalBtn.addEventListener("click", async () => {
    await componentLoader("dialog", "/component/dialog/dialog", true, false, {
      title:"회원탈퇴 하시겠습니까?",
      contents: "작성된 게시글과 댓글은 삭제됩니다."
    });

    const dialog = document.querySelector("#dialog dialog");
    dialog.showModal();

    const cancelBtn = document.querySelector("#dialog #cancel-button");
    cancelBtn.addEventListener("click", () => {
      dialog.close();
    });

    const confirmBtn = document.querySelector("#dialog #confirm-button");
    confirmBtn.addEventListener("click", async () => {
      try{
        const response = await memberApi.withdrawal(memberId);

        if(!response.ok){
          alert("회원 탈퇴 실패");
          return;
        }
        
      }catch(e){
        
      }finally{
        dialog.close();
        window.location.replace('/pages/signin/signin.html');
      }
      
    });
  });

}