import { api } from "/api/api.js";


const basePostUrl = "http://localhost:8080/posts";

export const postApi = {
    postPost: (data) =>
        api(basePostUrl, {
        method: "POST",
        body: JSON.stringify(data)}),
    
    getPosts: (id) =>{
        let url = `${basePostUrl}`;
        if(id != null){
            url += `?lastSeenId=${encodeURIComponent(id)}`;
        }
        return api(url, {method: "GET"});
    },

    getPost: (id) =>
        api(`${basePostUrl}/${encodeURIComponent(id)}`, {
        method: "GET"}),

    patchPost: (id, data) =>
        api(`${basePostUrl}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data)}),

    deletePost: (id) =>
        api(`${basePostUrl}/${encodeURIComponent(id)}`, {
        method: "DELETE"}),

    postLike: (id) =>
        api(`${basePostUrl}/${encodeURIComponent(id)}/like`, {
        method: "POST"}),

    deleteLike: (id) =>
        api(`${basePostUrl}/${encodeURIComponent(id)}/like`, {
        method: "DELETE"}),
};