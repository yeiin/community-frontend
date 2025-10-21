export async function api(url, options = {}) {
    
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("accessToken");
  if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;
  
  const mergedOptions = {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  };

  const response = await fetch(url, mergedOptions);
  return response;
}