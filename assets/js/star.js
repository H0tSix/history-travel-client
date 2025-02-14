import { StarCard } from '../../component/StarCard.js';

export class StarContent {
  constructor(container) {
    this.container = container;
    this.starCard = new StarCard(); // StarCard 인스턴스 생성
    this.famousPeople = [];
    this.currentPage = 0;
    this.isLoading = false;
  }

  async getNewFigure(country, year) {
    try {
      const response = await fetch('https://fierce-hyper-pear.glitch.me/recommend-star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          era: year,
          country: country,
          previousFigures: this.famousPeople.map(person => person.name),
        }),
      });
      if (!response.ok) throw new Error('API 요청 실패');
      const figureData = await response.json();
      if (figureData.error) throw new Error(figureData.message || figureData.error);
      this.famousPeople.push(figureData);
      return figureData;
    } catch (error) {
      console.error('Error fetching new figure:', error);
      return null;
    }
  }

  async loadContent(selectedCountry, selectedYear) {
    try {
      const cardWrapper = this.container.querySelector('.card-wrapper');

      // 로딩 카드 생성 및 추가
      let card = this.starCard.render('loading');
      cardWrapper.appendChild(card);
      this.container.classList.add('active');

      // 스크롤바 숨기기 스타일 적용
      const containerInner = this.container.querySelector('.star-cards-container');
      containerInner.style.cssText += `
        -ms-overflow-style: none;
        scrollbar-width: none;
      `;

      const figureData = await this.getNewFigure(selectedCountry, selectedYear);
      let newCard;
      if (figureData) {
        newCard = this.starCard.render('content', {
          figure: figureData,
          country: selectedCountry,
          year: selectedYear,
        });
      } else {
        newCard = this.starCard.render('error', {
          message: '위인 정보를 불러오는데 실패했습니다.',
        });
      }
      cardWrapper.replaceChild(newCard, card);
      this.currentPage = 1;
      this.setupScrollListener(selectedCountry, selectedYear);
    } catch (error) {
      console.error('Error in loadContent:', error);
    }
  }

  async loadMoreCards(country, year) {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      const cardWrapper = this.container.querySelector('.card-wrapper');

      // 로딩 카드 추가
      let loadingCard = this.starCard.render('loading');
      cardWrapper.appendChild(loadingCard);

      const figureData = await this.getNewFigure(country, year);
      let newCard;
      if (figureData) {
        newCard = this.starCard.render('content', {
          figure: figureData,
          country: country,
          year: year,
        });
      } else {
        newCard = this.starCard.render('error', {
          message: '위인 정보를 불러오는데 실패했습니다.',
        });
      }
      cardWrapper.replaceChild(newCard, loadingCard);
      this.currentPage++;
    } finally {
      this.isLoading = false;
    }
  }

  setupScrollListener(country, year) {
    const container = this.container.querySelector('.star-cards-container');
    let startY = 0;

    container.addEventListener('scroll', () => {
      if (container.scrollTop === 0) {
        const wheelEvent = e => {
          if (e.deltaY < 0) {
            document.querySelector('.map-slide').classList.remove('slide-up');
            this.container.classList.remove('active');
            container.removeEventListener('wheel', wheelEvent);
          }
        };
        container.addEventListener('wheel', wheelEvent);
      }

      if (this.isLoading) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        this.loadMoreCards(country, year);
      }
    });

    container.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
    });

    container.addEventListener('touchmove', e => {
      if (container.scrollTop === 0) {
        const currentY = e.touches[0].clientY;
        if (currentY - startY > 50) {
          document.querySelector('.map-slide').classList.remove('slide-up');
          this.container.classList.remove('active');
        }
      }
    });
  }
}
