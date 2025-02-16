export class StarCard {
  constructor(container) {
    this.container = container;
    this.token = localStorage.getItem('authToken');
  }

  loading() {
    return `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">위인 정보를 불러오는 중...</p>
      </div>
    `;
  }

  error(message = '위인 정보를 불러오는데 실패했습니다.') {
    return `
      <div class="error-container">
        <p class="error-text">${message}</p>
        <button class="retry-button" onclick="location.reload()">다시 시도</button>
      </div>
    `;
  }

  content(figureData, country, year) {
    return `
      <div class="card-content">
        <div class="portrait-container">
          <img src="${figureData.portrait}" alt="${figureData.name} 초상화" class="portrait-image">
        </div>
        <div class="info-container">
          <!-- 인물 이름과 팔로우 버튼을 같은 줄에 배치 -->
          <div class="name-follow-container">
            <h3 class="figure-name">${figureData.name}</h3>
            <button class="follow-btn">팔로우</button>
          </div>
          <div class="figure-meta">
            <p><strong>국가:</strong> ${country}</p>
            <p><strong>시대:</strong> ${year}년대</p>
          </div>
          <div class="description-container">
            ${figureData.description}
          </div>
        </div>
      </div>
    `;
  }

  createCard() {
    const card = document.createElement('div');
    card.className = 'person-card';
    return card;
  }

  render(type, data = {}) {
    const card = this.createCard();
    switch (type) {
      case 'loading':
        card.innerHTML = this.loading();
        break;
      case 'error':
        card.innerHTML = this.error(data.message);
        break;
      case 'content':
        card.innerHTML = this.content(data.figure, data.country, data.year);
        // 팔로우 버튼 이벤트 등록
        this.addFollowEvent(card, data.figure, data.country, data.year);
        break;
    }
    return card;
  }

  addFollowEvent(card, figure, country, year, token) {
    const followBtn = card.querySelector('.follow-btn');
    if (!followBtn) return;

    followBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('http://localhost:3000/star/createStar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            star_name: figure.name,
            country: country,
            year: year,
          }),
        });

        const result = await response.json();
        console.log(result);

        if (!response.ok) {
          throw new Error(result.message || '위인 등록 중 오류가 발생했습니다.');
        }

        // feedStorage.html로 이동하며 쿼리 파라미터로 데이터 전달
        const queryParams = new URLSearchParams({
          name: figure.name,
          era: year,
          desc: figure.description,
        });
        window.location.href = `./feedStorage.html?${queryParams.toString()}`;
      } catch (error) {
        console.error(error);
        alert('위인 등록 중 오류 발생: ' + error.message);
      }
    });
  }
}
