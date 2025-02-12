function starFeedMain() {
  const commentToggle = document.getElementById("commentToggle");
  const commentList = document.getElementById("commentList");

  commentToggle.addEventListener("click", function (event) {
    event.preventDefault();
    commentList.style.display =
      commentList.style.display === "none" ? "block" : "none";
  });
}

document.addEventListener("DOMContentLoaded", starFeedMain);
