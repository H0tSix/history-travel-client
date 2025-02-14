async function main() {
    async function handleCC(event) {
      event.preventDefault(); // ✅ 기본 Form 제출 막기 (새로고침 방지)
  
      // // ✅ 로딩 스피너 표시
      const loadingSpinner = document.getElementById("loading-spinner");
      loadingSpinner.style.display = "block";
  
      // // ✅ 서버 API URL (로컬 서버로 변경)
      const url = "http://localhost:3000"; // 로컬 서버로 URL 변경
      // const formData = new FormData(document.querySelector("#ccForm"));
      // const text = formData.get("text").trim(); // 사용자가 입력한 위인의 이름 가져오기
      const text = "이순신"   // 고쳐야 함
      // // ✅ 검색어가 없으면 요청하지 않음
      // if (!text) {
      //   alert("검색할 위인의 이름을 입력하세요!");
      //   loadingSpinner.style.display = "none";
      //   return;
      // }
  
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("로그인 정보가 없습니다. 토큰을 확인하세요.");
            return;
        }
        const response = await fetch(`${url}/llm/createSI`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,  // 인증 토큰을 헤더에 추가
              'Content-Type': 'application/json'   // 전송할 데이터의 형식은 JSON
          },
          body: JSON.stringify({
              text
          })
        });
  
        // ✅ 응답이 정상인지 확인
        if (!response.ok) {
          throw new Error(`서버 응답 오류: ${response.status}`);
        }
  
        const json = await response.json(); // 응답을 JSON으로 변환
        console.log("📢 서버 응답 데이터:", json); // 🔥 서버에서 받은 데이터 확인 (디버깅용)
  
        // ✅ json이 제대로 생성되지 않았을 경우 대비
        if (!json || !json.achievements || !Array.isArray(json.achievements)) {
          throw new Error("서버에서 받은 업적 데이터가 올바르지 않습니다.");
        }
  
        // ✅ 로딩 스피너 숨기기
        loadingSpinner.style.display = "none";
  
        // ✅ 🔥 위인 이름 업데이트
        document.getElementById("profile-name").textContent = json.name || "이름 없음"; // 기본값 처리
  
        // ✅ 🔥 프로필 이미지 업데이트
        const profileImageTag = document.getElementById("profile-image");
        profileImageTag.src = json.profileImage || "default-profile.png"; // 기본 프로필 이미지
        profileImageTag.onerror = () => {
          console.error("❌ 프로필 이미지 로드 실패:", json.profileImage);
          profileImageTag.src = "default-profile.png"; // 기본 프로필 이미지로 대체
        };
  
        // ✅ 🔥 업적 이미지 표시 영역 초기화 후 추가
        const imageContainer = document.getElementById("image-container");
        imageContainer.innerHTML = ""; // 기존 업적 이미지 삭제
  
        json.achievements.forEach(({ achievement, imageUrl }, index) => {
          const achievementWrapper = document.createElement("div");
          achievementWrapper.classList.add("achievement-item", "text-center");
  
          const achievementTitle = document.createElement("h5");
          achievementTitle.textContent = `${index + 1}. ${achievement || "업적 정보 없음"}`;
  
          const imageTag = document.createElement("img");
          imageTag.classList.add("img-fluid", "mt-3", "achievement-image");
          imageTag.src = imageUrl || "default-image.png";
          imageTag.alt = achievement || `업적 이미지 ${index + 1}`;
  
          imageTag.onerror = () => {
            console.error("❌ 업적 이미지 로드 실패:", imageUrl);
            imageTag.src = "default-image.png"; // 기본 이미지 대체
          };
  
          achievementWrapper.appendChild(achievementTitle);
          achievementWrapper.appendChild(imageTag);
          imageContainer.appendChild(achievementWrapper);
        });
        console.log("📢 profile_image 값:", json.profileImage);


        const response2 = await fetch(`${url}/star/createStarImage`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,  // 인증 토큰을 헤더에 추가
              'Content-Type': 'application/json'   // 전송할 데이터의 형식은 JSON
          },
          body: JSON.stringify({
              "star_name": text,
              "profile_image": json.profileImage
          })
        });
        
        const json2 = await response2.json(); // 응답을 JSON으로 변환
        console.log("📢 서버 응답 데이터:", json2); // 🔥 서버에서 받은 데이터 확인 (디버깅용)

      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        alert("위인 정보를 불러오는 중 오류가 발생했습니다.");
        loadingSpinner.style.display = "none";
      }
    }
  
    document.querySelector("#ccForm").addEventListener("submit", handleCC);
  }
  
  document.addEventListener("DOMContentLoaded", main);
  