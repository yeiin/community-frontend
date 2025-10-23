import { componentLoader } from '/global/componentLoader.js';
import { renderHeader } from "/component/header/header.js";
import { postApi } from "/api/post/postApi.js";

let titleCheck = false;
let contentCheck = false;

document.addEventListener("DOMContentLoaded", async () => {
  
  const params = new URLSearchParams(location.search);
  const isNew = params.get('isNew');

  await componentLoader("header","/component/header/header", true, true, null);
  renderHeader({ back: true, profile: true });
  
  await componentLoader("submit-button", "/component/button/main-button/main-button", true, false, {
    text: "완료"
  });
  
  let postId = null;

  if(isNew === "false"){
    const saved = sessionStorage.getItem('post');
    const json = JSON.parse(saved);
    const title = document.querySelector("#title-text");
    const content = document.querySelector("#content-text");
    postId = json.postBasic.id;
    title.defaultValue = json.postBasic.title;
    content.defaultValue = json.postBasic.contents;
    titleCheckToTrue();
    contentCheckToTrue();
  }

  addEventListenerToTitleInput();
  addEventListenerToContentInput();
  addEventListenerToSubmitButton(isNew, postId);

});


function addEventListenerToTitleInput(){
  const titleInput = document.querySelector("#title-text");
  titleInput.addEventListener("input", ()=>{

    if(titleInput.value != null && titleInput.value.length !=0){
      titleCheckToTrue();
    }else{
      titleCheckToFalse();
    }
  });
}

function addEventListenerToContentInput(){
  const content = document.querySelector("#content-text");
  content.addEventListener("input", ()=>{

    if(content.value != null && content.value.length !=0){
      contentCheckToTrue();
    }else{
      contentCheckToFalse();
    }
  });
}


function addEventListenerToSubmitButton(isNew,postId){
  const submitBtn = document.querySelector("#submit-button button");
  submitBtn.disabled = true;

  submitBtn.addEventListener("click", async() => {
    if(submitBtn.disabled) return;

    try{
      const title = document.querySelector("#title-text");
      const content = document.querySelector("#content-text");


      let response = null;

      if(isNew != "false"){
        response = await postApi.postPost({title: title.value, contents: content.value, imageUrl: null});
      }else{
        response = await postApi.patchPost(postId, {title: title.value, contents: content.value, imageUrl: null}); 
      }

      if(!response.ok){
        alert("게시물 저장 실패");
        return;
      }
      
      sessionStorage.setItem("shouldReload", "true");

    }catch(e){

    }finally{
      history.back(); 
    }
  });
}

function titleCheckToTrue(){
  const titleHelperText = document.getElementById("title-helper-text");

  titleCheck = true;
  titleHelperText.style.visibility = "hidden";

  changeSubmitButtonState();
}

function titleCheckToFalse(){
  const titleHelperText = document.getElementById("title-helper-text");

  titleCheck = false;
  titleHelperText.style.visibility = "visible";
  changeSubmitButtonState();
}
 
function contentCheckToTrue(){
  const contentHelperText = document.getElementById("content-helper-text");
  
  contentCheck = true;
  contentHelperText.style.visibility = "hidden";
  changeSubmitButtonState();
}

function contentCheckToFalse(){
  const contentHelperText = document.getElementById("content-helper-text");
  
  contentCheck = false;
  contentHelperText.style.visibility = "visible";
  changeSubmitButtonState();
}

function changeSubmitButtonState(){
  const submitBtn = document.querySelector("#submit-button button");

  if(titleCheck && contentCheck){
    submitBtn.disabled = false;
  }else{
    submitBtn.disabled = true;
  }
}