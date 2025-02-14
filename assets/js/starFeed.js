const commentForm = document.querySelector("#comment-form");
const commentInput = document.querySelector("#comment-input");

async function loadFeedData(id = 1) {
  const url = "http://127.0.0.1:3000";

  const response = await fetch(`${url}/feed/getFeed?id=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  const { fId, feed_text, feed_image, STAR } = data;
  const { sId, star_name, profile_image, USER } = STAR;
  const { id: userId, uId } = USER;

  const profile_image2 = "./assets/images/00_img.jpeg";

  document.querySelectorAll(".profile-name").forEach((element) => {
    element.textContent = star_name;
  });
  document.querySelector("#profile-img").src = profile_image2;
  document.querySelector("#feed-text").textContent = feed_text;
  document.querySelector("#feed-img").src = profile_image2;

  commentForm.dataset.uid = userId;
  commentForm.dataset.fid = fId;
  commentForm.dataset.sid = sId;
}

commentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(commentForm);
  const text = formData.get("comment")?.trim();

  if (!text) {
    alert("댓글을 입력하세요.");
    return;
  }

  const uId = commentForm.dataset.uid;
  const fId = commentForm.dataset.fid;
  const sId = commentForm.dataset.sid;

  try {
    const response = await fetch("http://127.0.0.1:3000/feed/addComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ coment: text, uId, fId, sId }),
    });

    if (!response.ok) {
      throw new Error("댓글 등록 실패");
    }
  } catch (error) {
    console.error(error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadFeedData();
});
