export class StarCard {
  constructor(container) {
    this.container = container;
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
            ${figureData.portrait}
          </div>
          <div class="info-container">
            <h3 class="figure-name">${figureData.name}</h3>
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
        break;
    }
    return card;
  }
}
