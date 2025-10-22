
export function renderHeader({ back = false, profile = false, image = null } = {}) {

  if (back) {
    const backBtn = document.getElementById("header-back-button");
    backBtn.style.visibility = "visible"; 
    backBtn.onclick = () => history.back();
  }

  if (profile) {
    const profileImage = document.getElementById("header-profile-image");
    profileImage.style.visibility = "visible";
    if(image!=null){
      const img = document.createElement("img");
      img.src = "/assets/profile.png";
      img.alt = "프로필";
      img.addEventListener("click", () => {
        window.location.href = "/pages/profile/profile.html";
      });
      profileImage.appendChild(img);
    }
    renderHeaderProfile();
  }
}


export function renderHeaderProfile(){
  const profileBtn = document.getElementById("header-profile-image");
  const profileMenu = document.getElementById("profile-menu");

  profileBtn.addEventListener("click", () => {
    profileMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (event) => {
    if (!profileBtn.contains(event.target) && !profileMenu.contains(event.target)) {
      profileMenu.classList.add("hidden");
    }
  });

  const profileModifyBtn = document.getElementById("header-profile-modify-button");
  profileModifyBtn.addEventListener("click", () => {
    location.href = "/pages/profile/profile.html"
  });

  const passwordModifyBtn = document.getElementById("header-password-modify-button");
  passwordModifyBtn.addEventListener("click", () => {
    location.href = "/pages/password/password.html"
  });

  const logoutBtn = document.getElementById("logout-button");
  logoutBtn.addEventListener("click", (event) => {
   
  });


}