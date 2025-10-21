import { componentLoader } from '/global/componentLoader.js';
import { renderHeader } from "/component/header/header.js";
import { postApi } from "/api/post/postApi.js";

let isLoading = false;
let lastSeenId = null;
let fetchComplete = false;

document.addEventListener("DOMContentLoaded", async () => {
  
  //header
  await componentLoader("header","/component/header/header", true, true, null);
  renderHeader({ back: false, profile: true });
  
  await componentLoader("add-post-button", "/component/button/round-button/round-button", true, false, {
    text: "게시글 작성"
  });
  addEventListenerToPostButton();

  await fetchPosts();

  addEventListenerToScroll();  
});

function addEventListenerToPostButton(){

  const addPostBtn = document.querySelector("#add-post-button button");

  addPostBtn.addEventListener("click", async () => {  
    window.location.href = "/pages/writing/writing.html";
  });


}

function addEventListenerToScroll(){
  window.addEventListener("scroll", async () => {
    if (fetchComplete || isLoading) return;

    const scrollTop = window.scrollY;
    const innerHeight = window.innerHeight;
    const scrollHeight = document.body.scrollHeight;

    if (scrollTop + innerHeight >= scrollHeight - 100) {
      await fetchPosts();
    }
  });

}

async function fetchPosts() {
  isLoading = true;
  try{
    const response = await postApi.getPosts(lastSeenId);
    if(!response.ok) {
      if(response.status === 400){
        
      }else if(response.status === 401){
        alert("로그인이 필요합니다.");
      }else if(response.status === 404){
        fetchComplete = true;
      }else{
        alert("게시물 가져오기 실패");
      }
      return;
    }

    const result = await response.json();

    if (!result.posts || result.posts.length === 0) {
      fetchComplete = true;
      return;
    }

    await renderPost(result.posts);
    lastSeenId = result.posts[result.posts.length - 1].postBasic.id;


  }catch(e){
    alert("게시물 가져오기 실패");
  } finally{
    isLoading = false;
  }
}

async function renderPost(posts){
  const postContainer = document.getElementById("post-container");

  posts.forEach(async (post) => {
    const wrapper = document.createElement("div");
    wrapper.id = `post-card-${post.postBasic.id}`;
    wrapper.classList.add("post-wrapper");
    postContainer.appendChild(wrapper);

    await componentLoader(wrapper.id, "/component/post-summary-card/post-summary-card", true, false, {
      title: post.postBasic.title,
      created_at: post.postBasic.createdAt,
      like_count: post.postCounter.likes,
      comment_count: post.postCounter.comments,
      view_count: post.postCounter.views,
      nickname: post.poster.nickname
    });

    wrapper.dataset.postId = post.postBasic.id;
    wrapper.dataset.userId = post.poster.userId;

    const card = document.getElementById(wrapper.id);
    card.addEventListener("click", ()=>{
      location.href = `/pages/post/post.html?postId=${card.dataset.postId}`;
    });

  });
}