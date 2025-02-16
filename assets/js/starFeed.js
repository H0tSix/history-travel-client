const commentForm = document.querySelector("#comment-form");
const commentInput = document.querySelector(".comment-input");
const token = localStorage.getItem("authToken");
const url = "http://127.0.0.1:3000";

document.addEventListener("DOMContentLoaded", async () => {
  await loadFeedData();
  loadFeedCommentData();
});

async function loadFeedData() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("fId");

  const response = await fetch(`${url}/feed_coment/getFeed/${id}`, {
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

  document.querySelectorAll(".profile-name").forEach((element) => {
    element.textContent = star_name;
  });

  document.querySelector("#profile-img").src = profile_image;
  document.querySelector("#feed-text").textContent = feed_text;
  document.querySelector("#feed-img").src = feed_image;

  commentForm.dataset.uid = userId;
  commentForm.dataset.fid = fId;
  commentForm.dataset.sid = sId;
  commentForm.dataset.user = uId;
  commentForm.dataset.star = star_name;
  commentForm.dataset.profile_image = profile_image;
}

async function loadFeedCommentData() {
  const fId = commentForm.dataset.fid;
  if (!fId) return;

  try {
    const response = await fetch(`${url}/feed_coment/getComment?fId=${fId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const comments = await response.json();

    if (!response.ok) {
      throw new Error("댓글 불러오기 실패");
    }
    // 댓글 영역 초기화
    const commentSection = document.querySelector(".comment-section");
    commentSection.innerHTML = "";

    const user = commentForm.dataset.user;
    const star = commentForm.dataset.star;
    const profile_image = commentForm.dataset.profile_image;
    const user_image = "./assets/images/user_profile.png";
    const commentMap = new Map();

    comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    comments.forEach(({ fcId, coment, parent_id }) => {
      let newComment = document.createElement("div");

      if (parent_id === null) {
        newComment.classList.add("comment");
        newComment.innerHTML = `
          <img src="${user_image}" alt="Profile" class="profile-img">
          <strong>${user}</strong> <span>${coment}</span>
        `;

        commentMap.set(fcId, newComment);
        commentSection.appendChild(newComment);
      } else {
        newComment.classList.add("reply");
        newComment.innerHTML = `
          <img src="${profile_image}" alt="Profile" class="profile-img">
          <strong>${star}</strong> <span>${coment}</span>
        `;

        const parentComment = commentMap.get(parent_id);
        if (parentComment) {
          parentComment.after(newComment);
        } else {
          commentSection.appendChild(newComment);
        }
      }
    });
  } catch (error) {
    console.error("댓글 조회 실패:", error);
  }
}

async function feedCommentChatAdd(fcId, fId, uId, sId, comment, star) {
  try {
    const response = await fetch(`${url}/feed_coment/addCommetChat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ parent_id: fcId, fId, uId, sId, comment, star }),
    });

    if (!response.ok) {
      throw new Error("AI 답글 생성 실패");
    }
  } catch (error) {
    console.error("AI 답글 생성 중 오류 발생:", error);
  }
}

commentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(commentForm);
  const coment = formData.get("comment")?.trim();

  if (!coment) {
    alert("댓글을 입력하세요.");
    return;
  }

  const uId = commentForm.dataset.uid;
  const fId = commentForm.dataset.fid;
  const sId = commentForm.dataset.sid;
  const star = commentForm.dataset.star;

  try {
    const response = await fetch(`${url}/feed_coment/addComment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ coment, uId, fId, sId }),
    });

    commentInput.value = "";

    const { fcId } = await response.json();

    showLoadingMask();

    feedCommentChatAdd(fcId, fId, uId, sId, coment, star);

    setTimeout(() => {
      loadFeedCommentData();
      hideLoadingMask();
    }, 2000);

    if (!response.ok) {
      throw new Error("댓글 등록 실패");
    }
  } catch (error) {
    hideLoadingMask();
    console.error(error);
  }
});

function showLoadingMask() {
  document.getElementById("loading-mask").style.display = "flex";
}

// 로딩 마스크 숨기기 함수
function hideLoadingMask() {
  document.getElementById("loading-mask").style.display = "none";
}

document.querySelector("#back-btn").addEventListener("click", () => {
  window.history.back();
});
