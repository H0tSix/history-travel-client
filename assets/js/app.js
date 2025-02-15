async function getLatestStarName() {
  console.log("📢 백엔드에서 최신 스타 이름 불러오는 중...");

  try {
      const response = await fetch("http://localhost:3000/supabase/star");
      if (!response.ok) throw new Error("백엔드에서 스타 데이터를 가져올 수 없음");

      const data = await response.json();
      console.log("✅ 최신 스타 이름:", data.starName);
      return data.starName;
  } catch (error) {
      console.error("❌ Supabase에서 데이터 가져오기 실패:", error);
      return "이순신";  // 기본값 반환
  }
}

// ✅ 검색 실행 함수 (클릭 혹은 페이지 로드 시 실행됨)
async function handleCC(event) {
    if (event) event.preventDefault(); // ✅ 기본 Form 제출 막기 (새로고침 방지)

    // ✅ 로딩 스피너 요소 가져오기
    const loadingSpinner = document.getElementById("loading-spinner");
    if (loadingSpinner) loadingSpinner.style.display = "block"; // 🔹 로딩 UI 활성화

    // ✅ Supabase에서 최신 스타 이름 가져오기
    const text = await getLatestStarName();

    // ✅ 서버 API URL (백엔드 요청 경로)
    const url = "http://localhost:3000"; // 🔹 로컬 백엔드 API 주소

    try {
        // ✅ 로컬 스토리지에서 사용자 인증 토큰 가져오기
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("로그인 정보가 없습니다. 토큰을 확인하세요.");
            return;
        }

        // ✅ 서버에 최신 스타 이름을 POST 요청으로 전달하여 결과 가져오기
        const response = await fetch(`${url}/llm/createSI`, {
            method: 'POST',  // ✅ HTTP POST 요청
            headers: {
                'Authorization': `Bearer ${token}`,  // 🔹 인증 토큰 추가 (JWT 등)
                'Content-Type': 'application/json'  // 🔹 JSON 데이터 전송
            },
            body: JSON.stringify({ text })  // ✅ Supabase에서 가져온 최신 스타 이름을 전송
        });

        // ✅ 응답 상태 확인
        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }

        // ✅ JSON 데이터 변환
        const json = await response.json();
        console.log("📢 서버 응답 데이터:", json);

        // ✅ 응답 데이터 유효성 검사
        if (!json || !json.achievements || !Array.isArray(json.achievements)) {
            throw new Error("서버에서 받은 업적 데이터가 올바르지 않습니다.");
        }

        // ✅ 로딩 스피너 숨기기
        if (loadingSpinner) loadingSpinner.style.display = "none";

        // ✅ 🔥 위인 이름 업데이트 (HTML 요소에 적용)
        document.getElementById("profile-name").textContent = json.name || "이름 없음"; // 🔹 이름이 없을 경우 "이름 없음" 표시

        // ✅ 🔥 프로필 이미지 업데이트
        const profileImageTag = document.getElementById("profile-image");
        profileImageTag.src = json.profileImage || "default-profile.png"; // 🔹 기본 프로필 이미지 설정
        profileImageTag.onerror = () => {
            console.error("❌ 프로필 이미지 로드 실패:", json.profileImage);
            profileImageTag.src = "default-profile.png"; // 🔹 이미지 로드 실패 시 기본 이미지 대체
        };

        // ✅ 🔥 업적 이미지 표시 (기존 데이터 삭제 후 새로 추가)
        const imageContainer = document.getElementById("image-container");
        imageContainer.innerHTML = ""; // 🔹 기존 업적 이미지 삭제

        json.achievements.forEach(({ achievement, imageUrl }, index) => {
            const achievementWrapper = document.createElement("div");
            achievementWrapper.classList.add("achievement-item", "text-center");

            const achievementTitle = document.createElement("h5");
            achievementTitle.textContent = `${index + 1}. ${achievement || "업적 정보 없음"}`;

            const imageTag = document.createElement("img");
            imageTag.classList.add("img-fluid", "mt-3", "achievement-image");
            imageTag.src = imageUrl || "default-image.png";
            imageTag.alt = achievement || `업적 이미지 ${index + 1}`;

            // ✅ 이미지 로드 실패 시 기본 이미지로 변경
            imageTag.onerror = () => {
                console.error("❌ 업적 이미지 로드 실패:", imageUrl);
                imageTag.src = "default-image.png";
            };

            achievementWrapper.appendChild(achievementTitle);
            achievementWrapper.appendChild(imageTag);
            imageContainer.appendChild(achievementWrapper);
        });

        console.log("📢 profile_image 값:", json.profileImage);

    } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        alert("위인 정보를 불러오는 중 오류가 발생했습니다.");
        if (loadingSpinner) loadingSpinner.style.display = "none"; // 🔹 오류 발생 시 로딩 스피너 제거
    }
}

// ✅ 페이지 로드 시 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", async function () {
    const formElement = document.querySelector("#ccForm");

    // ✅ 검색 버튼이 있을 경우 이벤트 리스너 추가
    if (formElement) {
        formElement.addEventListener("submit", handleCC);
    } else {
        console.warn("⚠️ #ccForm 요소를 찾을 수 없습니다.");
    }

    // ✅ 페이지 로드 시 최신 스타 정보 자동 로드
    await handleCC(new Event("submit"));
});
