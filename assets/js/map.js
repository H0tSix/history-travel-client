let map;
let selectedPolygon = null;
let countryPolygons = new Map();

// 대륙별 중심 좌표와 줌 레벨 정의
const continentCoordinates = {
  AS: { lat: 35, lng: 105, zoom: 3 },
  EU: { lat: 50, lng: 10, zoom: 4 },
  NA: { lat: 50, lng: -100, zoom: 3 },
  SA: { lat: -15, lng: -60, zoom: 3 },
  AF: { lat: 0, lng: 20, zoom: 3 },
  OC: { lat: -25, lng: 135, zoom: 4 },
};

async function initMap(lat = 38, lng = 128) {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: { lat: lat, lng: lng },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    ],
  });

  try {
    const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const data = await response.json();

    data.features.forEach(feature => {
      const countryName = feature.properties.ADMIN;
      const polygons = [];

      if (feature.geometry.type === 'Polygon') {
        const paths = feature.geometry.coordinates[0].map(c => ({
          lat: c[1],
          lng: c[0],
        }));
        createPolygon(paths, countryName, polygons);
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(coord => {
          const paths = coord[0].map(c => ({
            lat: c[1],
            lng: c[0],
          }));
          createPolygon(paths, countryName, polygons);
        });
      }

      countryPolygons.set(countryName, polygons);
    });

    addContinentNavigation();
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
  }
}

function createPolygon(paths, countryName, polygons) {
  const polygon = new google.maps.Polygon({
    paths: paths,
    strokeColor: '#808080',
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: '#FFFFFF',
    fillOpacity: 0.35,
    map: map,
  });

  polygons.push(polygon);

  // 마우스 오버 효과
  google.maps.event.addListener(polygon, 'mouseover', function () {
    if (selectedPolygon !== countryName) {
      countryPolygons.get(countryName).forEach(p => {
        p.setOptions({
          strokeColor: '#404040',
          strokeWeight: 2,
          fillColor: '#808080',
          fillOpacity: 0.3,
        });
      });
    }
  });

  // 마우스 아웃 효과
  google.maps.event.addListener(polygon, 'mouseout', function () {
    if (selectedPolygon !== countryName) {
      countryPolygons.get(countryName).forEach(p => {
        p.setOptions({
          strokeColor: '#808080',
          strokeWeight: 1,
          fillColor: '#FFFFFF',
          fillOpacity: 0.35,
        });
      });
    }
  });

  // 국가 클릭 시 이벤트
  google.maps.event.addListener(polygon, 'click', function () {
    if (selectedPolygon) {
      countryPolygons.get(selectedPolygon).forEach(p => {
        p.setOptions({
          strokeColor: '#808080',
          strokeWeight: 1,
          fillColor: '#FFFFFF',
          fillOpacity: 0.35,
        });
      });
    }

    countryPolygons.get(countryName).forEach(p => {
      p.setOptions({
        strokeColor: '#833AB4',
        strokeWeight: 3,
        fillColor: '#FCB045',
        fillOpacity: 0.15,
      });
    });

    selectedPolygon = countryName;

    // 선택한 국가 이름 표시
    const selectedCountryDiv = document.querySelector('.selected-country');
    if (selectedCountryDiv) {
      selectedCountryDiv.textContent = `선택한 국가: ${countryName}`;
    }
  });
}

// 대륙 메뉴 이벤트 리스너 추가
function addContinentNavigation() {
  const menuItems = document.querySelectorAll('.menu-item[data-region]');

  menuItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const continent = item.getAttribute('data-region');

      if (continentCoordinates[continent]) {
        const { lat, lng, zoom } = continentCoordinates[continent];

        map.setCenter({ lat, lng });
        map.setZoom(zoom);

        highlightContinentCountries(continent);
      }
    });
  });
}

// 대륙 국가들 강조
function highlightContinentCountries(continent) {
  countryPolygons.forEach(polygons => {
    polygons.forEach(p => {
      p.setOptions({
        strokeColor: '#808080',
        strokeWeight: 1,
        fillColor: '#FFFFFF',
        fillOpacity: 0.35,
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const yearDropdown = document.getElementById('year-dropdown');

  if (yearDropdown) {
    yearDropdown.addEventListener('change', function () {
      console.log(`선택한 연대: ${this.value}년대`);
    });
  }
});

// 지도 초기화
initMap();
