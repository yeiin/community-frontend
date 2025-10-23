import { componentLoader } from '/global/componentLoader.js';
import { renderHeader } from "/component/header/header.js";
import { postApi } from "/api/post/postApi.js";
import { commentApi } from "/api/comment/commentApi.js";

let isLoading = false;
let lastSeenId = null;
let fetchComplete = false;
let isLike = false;

const params = new URLSearchParams(location.search);
const postId = params.get('postId');

let commentSubmitBtn;
let comment;


document.addEventListener("DOMContentLoaded", async () => {
  
  await componentLoader("header","/component/header/header", true, true, null);
  renderHeader({ back: true, profile: true });

  await fetchPost();

  await componentLoader("comment-submit-button", "/component/button/round-button/round-button", true, false, {
    text: "댓글 등록"
  });
  addEventListenerToComment();

  commentSubmitBtn = document.querySelector("#comment-submit-button round-button .round-button");
  comment = document.querySelector("#comment-text");

  await fetchComments();
  addEventListenerToOwnButtons();
  addEventListenerToScroll();

  window.addEventListener("pageshow", (event) => {
    if (event.persisted && sessionStorage.getItem("shouldReload")==="true") {
      sessionStorage.removeItem("shouldReload");
      window.location.reload();
    }
  });
});

function addEventListenerToComment(){
  commentSubmitBtn.disabled = true;

  comment.addEventListener("input", () =>{
    if(comment == null && comment.value.length == 0) commentSubmitBtn.disabled = true;
    else commentSubmitBtn.disabled = false;
  });

  commentSubmitBtn.addEventListener("click", async () => {
    if(commentSubmitBtn.disabled) return;

    try{
      const commentId = sessionStorage.getItem("commentId");
      let response;

      if(!commentId){
        response = await commentApi.postComment(postId,{contents: comment.value});
      }else{
        console.log(commentId);
        response = await commentApi.patchComment(postId, commentId, {contents: comment.value});
      }

      if(!response.ok){
        if(response.status === 413){
          alert("댓글이 너무 깁니다.");
        }else if(response.status === 404){
          alert("게시글을 찾을 수 없습니다.");
          history.back();
        }else{
          alert("댓글 작성에 실패했습니다.");
        }
        return;
      }

    }catch(e){

    }finally{
      sessionStorage.removeItem("commentId");
      window.location.reload();
    }
  });
}

function addEventListenerToOwnButtons(){
  const postModifyBtn = document.querySelector("#post-modify-button");
  const postDeleteBtn = document.querySelector("#post-delete-button");

  postModifyBtn.addEventListener("click", async () => {  
    window.location.href = "/pages/writing/writing.html?isNew=false";
  });

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
          if(response.status === 403){
            alert("삭제가 할 수 없습니다.");
          }if(response.status === 404){
            alert("게시물을 찾을 수 없습니다.");
          }else{
            alert("게시물 삭제 실패");
          } 
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

function addEventListenerToScroll(){
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

async function fetchPost(){
  try{
    const response = await postApi.getPost(postId);

    if(!response.ok){
      if(response.status === 404){
        alert("게시물을 찾을 수 없습니다.");
        history.back();
      }
      return;
    }

    //내용 채우기
    const result = await response.json();
    
    const title = document.getElementById("post-title");
    title.innerText = result.postBasic.title;
    
    const posterNickname = document.getElementById("poster-nickname");
    posterNickname.innerText = result.poster.nickname;
    
    const createdAt = document.getElementById("post-created-at");
    createdAt.innerText = result.postBasic.createdAt;
    
    const content = document.getElementById("post-content");
    content.innerText = result.postBasic.contents;

    //좋아요
    isLike = result.isLike;

    const likes = document.getElementById("post-like");
    likes.querySelector("#like-count").innerText = result.postCounter.likes;

    if (isLike) likes.setAttribute("active", "");
    else likes.removeAttribute("active");

    const comments = document.getElementById("comment-count");
    comments.innerText = result.postCounter.comments;

    const views = document.getElementById("view-count");
    views.innerText = result.postCounter.views;
    
    if(!result.poster.isMe){
      document.getElementById("post-modify-button").style.visibility = "hidden";
      document.getElementById("post-delete-button").style.visibility = "hidden";
    }

    sessionStorage.setItem("post", JSON.stringify(result));
  }catch(e){

  }


  likes.addEventListener("click", async () =>{

    if(isLoading) return;
    isLoading = true;
      if(!isLike){       
        try{
          const response = await postApi.postLike(postId);

          if(!response.ok){
            if(response.status === 409){
              alert("이미 좋아요한 게시물입니다.");
            }else{
              alert("좋아요 실패");
            }
            return;
          }

          likes.setAttribute("active", "");
          isLike = !isLike;
          window.location.reload();
        }catch(e){
          alert("좋아요 실패");
        }finally{
          isLoading = false;
        }
      }else{
        try{
          const response = await postApi.deleteLike(postId);

          if(!response.ok){
            if(response.status === 404){
              alert("좋아요 정보를 찾을 수 없습니다.");
            
            }else{
              alert("좋아요 취소 실패");
            }
            return;
          }
          likes.removeAttribute("active");
          isLike = !isLike;

          window.location.reload();
          
        }catch(e){
          alert("좋아요 취소 실패");
        }finally{
          isLoading = false;
        }
      }
    });
    
}

async function fetchComments(){
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

    if(!comment.poster.isMe){
      wrapper.querySelector("#comment-modify-button").style.visibility = "hidden";
      wrapper.querySelector("#comment-delete-button").style.visibility = "hidden";
    }else{
      wrapper.querySelector("#comment-modify-button").addEventListener("click",() => {
        const commentText = document.querySelector("#comment-text");

        commentText.value = comment.commentBasic.contents;
        sessionStorage.setItem("commentId", comment.commentBasic.commentId);

      });

      wrapper.querySelector("#comment-delete-button").addEventListener("click", async () => {

        try{
          await commentApi.deleteComment({postId: postId, commentId: comment.commentBasic.commentId});
          window.location.reload();

        }catch(e){

        }
      });
    }

    wrapper.dataset.commentId = comment.commentBasic.commentId;
    wrapper.dataset.userId = comment.poster.userId;    
  });
}