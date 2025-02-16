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
    let justLoaded = false;

    // wheel 이벤트: 위로 스크롤하면 지도 복귀, 아래로 스크롤하면 카드 추가
    container.addEventListener('wheel', async e => {
      if (e.deltaY < 0 && container.scrollTop <= 0) {
        // 위로 스크롤 시 지도 화면으로 복귀
        document.querySelector('.map-slide').classList.remove('slide-up');
        this.container.classList.remove('active');
      } else if (e.deltaY > 0) {
        // 아래로 스크롤: 컨테이너가 스크롤 가능하지 않거나 하단에 도달했을 때 카드 추가
        if (container.scrollHeight <= container.clientHeight || container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
          if (this.isLoading || justLoaded) return;
          justLoaded = true;
          await this.loadMoreCards(country, year);
          setTimeout(() => {
            justLoaded = false;
          }, 500);
        }
      }
    });

    // 스크롤 이벤트: 스크롤바가 활성화된 경우 하단 도달 시 카드 추가
    container.addEventListener('scroll', async () => {
      if (this.isLoading || justLoaded) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        justLoaded = true;
        await this.loadMoreCards(country, year);
        setTimeout(() => {
          justLoaded = false;
        }, 500);
      }
    });

    // 터치 이벤트: 위로 올리면 지도, 아래로 내리면 카드 추가
    container.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
    });
    container.addEventListener('touchmove', async e => {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 50 && container.scrollTop <= 0) {
        // 손가락을 아래로 당기면(화면이 내려가면) 지도로 복귀
        document.querySelector('.map-slide').classList.remove('slide-up');
        this.container.classList.remove('active');
      } else if (diff < -50) {
        // 손가락을 위로 올리면(화면이 올라가면) 카드 추가
        if (container.scrollHeight <= container.clientHeight || container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
          if (this.isLoading || justLoaded) return;
          justLoaded = true;
          await this.loadMoreCards(country, year);
          setTimeout(() => {
            justLoaded = false;
          }, 500);
        }
      }
    });
  }
}
