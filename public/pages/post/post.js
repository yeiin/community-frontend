import { componentLoader } from '/global/componentLoader.js';
import { renderHeader } from "/component/header/header.js";
import { postApi } from "/api/post/postApi.js";
import { commentApi } from "/api/comment/commentApi.js";

let isLoading = false;
let lastSeenId = null;
let fetchComplete = false;


document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const postId = params.get('postId');

  await componentLoader("header","/component/header/header", true, true, null);
  renderHeader({ back: true, profile: true });

  await fetchPost(postId);

  await componentLoader("comment-submit-button", "/component/button/round-button/round-button", true, false, {
    text: "댓글 등록"
  });
  addEventListenerToCommentSubmitButton(postId);

  await fetchComments(postId);
  addEventListenerToPostModifiyButton();
  addEventListenerToPostDeleteButton(postId);

  addEventListenerToScroll(postId);
  addEventListenerToLikeButton();

  window.addEventListener("pageshow", (event) => {
    if (event.persisted && sessionStorage.getItem("shouldReload")==="true") {
      sessionStorage.removeItem("shouldReload");
      window.location.reload();
    }
  });
});

function addEventListenerToCommentSubmitButton(postId){
  const commentSubmitBtn = document.querySelector("#comment-submit-button");
  
  commentSubmitBtn.addEventListener("click", async () => {
    const comment = document.querySelector("#comment-text");

    if(comment == null && comment.value.length == 0) return;

    try{
      const response = await commentApi.postComment(postId,{contents: comment.value});

      if(!response.ok){
        alert("댓글 작성에 실패했습니다.");
        return;
      }

    }catch(e){

    }finally{
      window.location.reload();
    }
  });

}

function addEventListenerToPostDeleteButton(postId){
  const postDeleteBtn = document.querySelector("#post-delete-button");

  postDeleteBtn.addEventListener("click", async () => {  
    await componentLoader("dialog", "/component/dialog/dialog", true, false, {
      title:"게시글을 삭제하시겠습니까?",
      contents: "삭제한 내용은 복구 할 수 없습니다."
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
        const response = await postApi.deletePost(postId);

        if(!response.ok){
          alert("게시물 삭제 실패");
          return;
        }
        
      }catch(e){
        
      }finally{
        dialog.close();

        requestAnimationFrame(() => {
          if (history.length > 1) {
            history.back();
          } else {
            window.location.replace('/pages/home/home.html');
          }
        });
      }
      
    });
  });
}

function addEventListenerToPostModifiyButton(){

  const postModifyBtn = document.querySelector("#post-modify-button");

  postModifyBtn.addEventListener("click", async () => {  
    window.location.href = "/pages/writing/writing.html?isNew=false";
  });
}


function addEventListenerToScroll(postId){
  window.addEventListener("scroll", async () => {
    if (fetchComplete || isLoading) return;

    const scrollTop = window.scrollY;
    const innerHeight = window.innerHeight;
    const scrollHeight = document.body.scrollHeight;

    if (scrollTop + innerHeight >= scrollHeight - 100) {
      await fetchComments(postId);
    }
  });

}

async function fetchPost(postId){
  try{
    const response = await postApi.getPost(postId);

    if(!response.ok){
      console.log(response.status);
      return;
    }

    const result = await response.json();
    
    const title = document.getElementById("post-title");
    title.innerText = result.postBasic.title;
    
    const posterNickname = document.getElementById("poster-nickname");
    posterNickname.innerText = result.poster.nickname;
    
    const createdAt = document.getElementById("post-created-at");
    createdAt.innerText = result.postBasic.createdAt;
    
    const content = document.getElementById("post-content");
    content.innerText = result.postBasic.contents;

    const likes = document.getElementById("like-count");
    likes.innerText = result.postCounter.likes;


    const comments = document.getElementById("comment-count");
    comments.innerText = result.postCounter.comments;

    const views = document.getElementById("view-count");
    views.innerText = result.postCounter.views;

    sessionStorage.setItem("post", JSON.stringify(result));

  }catch(e){

  }
}

async function fetchComments(postId){
  isLoading = true;

  try{
    const response = await commentApi.getComments({postId: postId, lastSeenId: lastSeenId});

    if(!response.ok){
      alert("댓글 조회 실패");
      return;
    }

    const result = await response.json();
    
    if (!result.comments || result.comments.length === 0) {
      fetchComplete = true;
      return;
    }

    await renderComments(result.comments);
    lastSeenId = result.comments[result.comments.length - 1].commentBasic.commentId;

  }catch(e){
    alert("댓글 가져오기 실패");
  }finally{
    isLoading = false;
  }
}

async function renderComments(comments){
  const commentContainer = document.getElementById("comment-container");

  comments.forEach(async (comment) => {
    const wrapper = document.createElement("div");
    wrapper.id = `comment-card-${comment.commentBasic.commentId}`;
    wrapper.classList.add("comment-wrapper");
    commentContainer.appendChild(wrapper);

    await componentLoader(wrapper.id, "/component/comment-card/comment-card", true, false, {
      nickname: comment.poster.nickname,
      created_at: comment.commentBasic.createdAt,
      contents: comment.commentBasic.contents
    });

    wrapper.dataset.commentId = comment.commentBasic.commentId;
    wrapper.dataset.userId = comment.poster.userId;    

  });
}

//TODO
async function addEventListenerToCommentCard() {

}

async function addEventListenerToLikeButton(postId) {
  const likeButton = document.getElementById("post-like");

  likeButton.addEventListener("click",()=>{
    try{ 

    }catch(e){

    }
  });
}