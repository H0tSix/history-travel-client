const commentForm = document.querySelector("#comment-form");
const commentInput = document.querySelector(".comment-input");
document.addEventListener("DOMContentLoaded", async () => {
  await loadFeedData();
  loadFeedCommentData();
});

async function loadFeedData(id = 1) {
  const url = "http://127.0.0.1:3000";

  const response = await fetch(`${url}/feed/getFeed?id=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
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
  commentForm.dataset.user = uId;
  commentForm.dataset.star = star_name;
}

async function loadFeedCommentData() {
  const fId = commentForm.dataset.fid;
  if (!fId) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:3000/feed/getComment?fId=${fId}`
    );
    const comments = await response.json();

    if (!response.ok) {
      throw new Error("댓글 불러오기 실패");
    }
    // 댓글 영역 초기화
    const commentSection = document.querySelector(".comment-section");
    commentSection.innerHTML = "";

    const user = commentForm.dataset.user;
    const star = commentForm.dataset.star;
    const commentMap = new Map();

    // 댓글 데이터를 순서대로 정렬 (부모 댓글 먼저, 그다음 답글)
    comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // 댓글을 렌더링
    comments.forEach(({ fcId, coment, parent_id }) => {
      let newComment = document.createElement("div");

      if (parent_id === null) {
        // 부모 댓글
        newComment.classList.add("comment");
        newComment.innerHTML = `<strong>${user}</strong> <span>${coment}</span>`;

        // 부모 댓글을 commentMap에 저장
        commentMap.set(fcId, newComment);
        commentSection.appendChild(newComment);
      } else {
        // 답글 (부모 댓글 바로 아래에 추가)
        newComment.classList.add("reply");
        newComment.innerHTML = `<strong>${star}</strong> <span>${coment}</span>`;

        // 부모 댓글 아래에 답글 추가
        const parentComment = commentMap.get(parent_id);
        if (parentComment) {
          parentComment.after(newComment); // 부모 댓글 다음에 배치
        } else {
          commentSection.appendChild(newComment); // 혹시 부모 댓글이 없으면 일반 추가
        }
      }
    });
  } catch (error) {
    console.error("댓글 조회 실패:", error);
  }
}

async function feedCommentChatAdd(fcId, fId, uId, sId, comment, star) {
  try {
    const response = await fetch("http://127.0.0.1:3000/feed/addCommetChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ parent_id: fcId, fId, uId, sId, comment, star }),
    });

    // console.log(await response.json());

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
    const response = await fetch("http://127.0.0.1:3000/feed/addComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
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
