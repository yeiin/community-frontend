import { componentLoader } from '/global/componentLoader.js';
import { renderHeader } from "/component/header/header.js";

document.addEventListener("DOMContentLoaded", async () => {
  
  await componentLoader("header","/component/header/header", true, true, null);
  renderHeader({ back: true, profile: true });
  
  await componentLoader("complete-button", "/component/button/main-button/main-button", true, false, {
    text: "완료"
    });
  

});
