const BASE_URL = 'http://localhost:3000';

const authForm = document.getElementById('authForm');
const submitButton = document.getElementById('submitButton');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirm = document.getElementById('passwordConfirm');
const nickname = document.getElementById('nickname');
const orDivider = document.getElementById('orDivider');
const kakaoLogin = document.getElementById('kakaoLogin');
const signupBox = document.getElementById('signupBox');
const signupLink = document.getElementById('signupLink');
const description = document.getElementById('description');

// 초기 스타일 설정
document.addEventListener('DOMContentLoaded', () => {
  passwordConfirm.style.transform = 'scaleY(0)';
  nickname.style.transform = 'scaleY(0)';
  passwordConfirm.style.height = '0';
  nickname.style.height = '0';
  passwordConfirm.style.opacity = '0';
  nickname.style.opacity = '0';
});

// 회원가입 함수
async function signup(email, password, nickname) {
  try {
    const response = await fetch(`${BASE_URL}/auth/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uId: nickname,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('회원가입 에러:', error);
    return { success: false, message: '회원가입 중 오류가 발생했습니다.' };
  }
}

// 로그인 함수
async function login(nickname, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uId: nickname,
        password: password,
      }),
    });

    const data = await response.json();

    // 로그인 성공 시 JWT 토큰을 로컬 스토리지에 저장
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    return { success: false, message: '로그인 중 오류가 발생했습니다.' };
  }
}

// 로그아웃 함수
function logout() {
  localStorage.removeItem('authToken');
  fetch(`${BASE_URL}/auth/logout`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  })
    .then(() => {
      window.location.href = '/login.html';
    })
    .catch(error => console.error('로그아웃 에러:', error));
}

// 카카오 로그인
function loginWithKakao() {
  Kakao.Auth.authorize({
    redirectUri: 'http://localhost:3000/oauth',
  });
}

function toggleSignupMode(e) {
  if (e) e.preventDefault();

  const isLoginMode = submitButton.textContent === '로그인';

  // 1단계: 버튼 텍스트 변경
  submitButton.textContent = isLoginMode ? '가입하기' : '로그인';
  signupBox.innerHTML = isLoginMode ? '계정이 있으신가요? <a href="#" id="signupLink">로그인</a>' : '계정이 없으신가요? <a href="#" id="signupLink">가입하기</a>';

  document.getElementById('signupLink').addEventListener('click', toggleSignupMode);

  if (isLoginMode) {
    // 회원가입 모드로 전환
    requestAnimationFrame(() => {
      // 먼저 요소들을 보이게 만들고
      passwordConfirm.hidden = false;
      nickname.hidden = false;
      description.hidden = false;

      // 다음 프레임에서 애니메이션 시작
      requestAnimationFrame(() => {
        description.style.transform = 'scaleY(1)';
        description.style.height = '40px';
        description.style.opacity = '1';
        description.style.margin = '-10px 40px 20px';

        passwordConfirm.style.transform = 'scaleY(1)';
        nickname.style.transform = 'scaleY(1)';
        passwordConfirm.style.height = '44px';
        nickname.style.height = '44px';
        passwordConfirm.style.opacity = '1';
        nickname.style.opacity = '1';
      });
    });
  } else {
    // 로그인 모드로 전환
    requestAnimationFrame(() => {
      signupBox.hidden = false;
      description.hidden = true;

      requestAnimationFrame(() => {
        description.style.transform = 'scaleY(0)';
        description.style.height = '0';
        description.style.opacity = '0';
        description.style.margin = '0 40px';

        passwordConfirm.style.transform = 'scaleY(0)';
        nickname.style.transform = 'scaleY(0)';
        passwordConfirm.style.height = '0';
        nickname.style.height = '0';
        passwordConfirm.style.opacity = '0';
        nickname.style.opacity = '0';
      });
    });

    setTimeout(() => {
      passwordConfirm.hidden = true;
      nickname.hidden = true;
    }, 300);
  }
}

// form submit 이벤트 핸들러
authForm.addEventListener('submit', async e => {
  e.preventDefault();

  const isSignupMode = submitButton.textContent === '가입하기';
  const email = emailInput.value;
  const password = passwordInput.value;
  const nicknameValue = isSignupMode ? nickname.querySelector('input').value : email; // 로그인시에는 email 필드를 uId로 사용

  try {
    if (isSignupMode) {
      // 회원가입 모드
      const passwordConfirmValue = passwordConfirm.querySelector('input').value;
      if (password !== passwordConfirmValue) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      const result = await signup(email, password, nicknameValue);
      if (result.message === '회원가입 성공') {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        // 회원가입 성공 시 로그인 모드로 전환
        toggleSignupMode();
        // 입력 필드 초기화
        emailInput.value = '';
        passwordInput.value = '';
        passwordConfirm.querySelector('input').value = '';
        nickname.querySelector('input').value = '';
      } else {
        alert(result.message || '회원가입 실패');
      }
    } else {
      // 로그인 모드
      const result = await login(nicknameValue, password);
      if (result.success) {
        window.location.href = '/map.html';
      } else {
        alert(result.message || '로그인 실패');
      }
    }
  } catch (error) {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
    console.error(error);
  }
});

// 이벤트 리스너
signupLink.addEventListener('click', toggleSignupMode);

// 버튼 상태 업데이트 함수
function updateButtonState() {
  const isSignupMode = submitButton.textContent === '가입하기';
  const requiredInputs = isSignupMode ? [emailInput, passwordInput, passwordConfirm.querySelector('input'), nickname.querySelector('input')] : [emailInput, passwordInput];

  const isValid = requiredInputs.every(input => input && input.value.length > 0);
  if (isValid) {
    submitButton.classList.add('active');
  } else {
    submitButton.classList.remove('active');
  }
}

// 모든 입력 필드에 이벤트 리스너 추가
[emailInput, passwordInput, passwordConfirm.querySelector('input'), nickname.querySelector('input')].forEach(input => {
  if (input) {
    input.addEventListener('input', updateButtonState);
  }
});
