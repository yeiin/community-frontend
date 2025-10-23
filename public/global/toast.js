export function showToast(message, isError = false, isReload) {
    const toast = document.createElement("div");
    toast.className = `toast ${isError ? "error" : "success"}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    toast.classList.add("show");

    setTimeout(() => toast.classList.add("show"), 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
            if(isReload) window.location.reload();
            
        }, 200);
    }, 1000);
}