import { api } from "/api/api.js";

const basePostUrl = "http://localhost:8080/posts/";
const baseCommentUrl = "/comments";

export const commentApi = {

    getComments: (data) =>{
        let url = `${basePostUrl}${data.postId}${baseCommentUrl}`;
        if(data.lastSeenId != null){
            url += `?lastSeenId=${encodeURIComponent(data.lastSeenId)}`;
        }
        return api(url, {method: "GET"});
    },

    postComment: (postId, data) => {
        let url = `${basePostUrl}${postId}${baseCommentUrl}`;
        api(url, {
        method: "POST",
        body: JSON.stringify(data)})
    },
    
    patchComment: (postId, commentId, data) => {
        let url = `${basePostUrl}${postId}${baseCommentUrl}/${commentId}`;
        api(url, {
        method: "PATCH",
        body: JSON.stringify(data)})
    },

    deleteComment: (data) => {
        let url = `${basePostUrl}${data.postId}${baseCommentUrl}/${data.commentId}`;
        api(url, {method: "DELETE"})
    },

};