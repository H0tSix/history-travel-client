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

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const error = urlParams.get('error');

  if (token) {
    // JWT 토큰 저장
    localStorage.setItem('authToken', token);
    // map.html로 리다이렉트
    window.location.href = '/map.html';
  } else if (error) {
    // 에러 처리
    alert('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
  }
});

// 카카오 로그인 버튼에 이벤트 리스너 추가
document.getElementById('kakaoLogin').addEventListener('click', e => {
  e.preventDefault();
  // 카카오 로그인 서버 엔드포인트로 이동
  window.location.href = 'http://localhost:3000/auth/kakao';
});

// 에러 메시지 처리 함수
function handleErrorMessage(inputElement, message, isError) {
  const formGroup = inputElement.closest('.form-group');
  let errorDiv = formGroup.querySelector('.error-message');

  if (isError) {
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      formGroup.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
  } else if (errorDiv) {
    errorDiv.remove();
  }
}

// 이메일 유효성 검사
function validateEmail(email) {
  const pattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
  return pattern.test(email);
}

// 폼 유효성 검사 및 버튼 상태 업데이트
function updateFormValidation() {
  const isSignupMode = submitButton.textContent === '가입하기';
  let isValid = true;
  if (emailInput.value) {
    const isValidEmail = validateEmail(emailInput.value);
    handleErrorMessage(emailInput, '올바른 이메일 형식이 아닙니다.', !isValidEmail);
    isValid = isValid && isValidEmail;
  }

  // 회원가입 모드일 때 추가 검증
  if (isSignupMode) {
    const passwordValue = passwordInput.value;
    const confirmValue = passwordConfirm.querySelector('input').value;

    if (passwordValue && confirmValue) {
      const passwordsMatch = passwordValue === confirmValue;
      handleErrorMessage(passwordConfirm.querySelector('input'), '비밀번호가 일치하지 않습니다.', !passwordsMatch);
      isValid = isValid && passwordsMatch;
    }

    // 모든 필수 입력값 확인
    const requiredInputs = [emailInput, passwordInput, passwordConfirm.querySelector('input'), nickname.querySelector('input')];

    isValid = isValid && requiredInputs.every(input => input && input.value.length > 0);
  } else {
    // 로그인 모드일 때는 이메일과 비밀번호만 확인
    isValid = isValid && emailInput.value && passwordInput.value;
  }

  // 버튼 상태 업데이트
  if (isValid) {
    submitButton.classList.add('active');
    submitButton.disabled = false;
  } else {
    submitButton.classList.remove('active');
    submitButton.disabled = true;
  }
}

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
async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uId: email, // email을 uId로 사용
        password: password,
      }),
    });

    const data = await response.json();
    console.log(data);

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

  // 모드 전환 시 에러 메시지 초기화
  [emailInput, passwordInput, passwordConfirm.querySelector('input'), nickname.querySelector('input')].forEach(input => {
    if (input) {
      handleErrorMessage(input, '', false);
    }
  });

  // 버튼 상태 업데이트
  updateFormValidation();
}

// form submit 이벤트 핸들러
authForm.addEventListener('submit', async e => {
  e.preventDefault();

  const isSignupMode = submitButton.textContent === '가입하기';
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    if (isSignupMode) {
      const nicknameValue = nickname.querySelector('input').value;
      const result = await signup(email, password, nicknameValue);
      if (result.message === '회원가입 성공') {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
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
      // 로그인 모드 - email을 uId로 사용
      const result = await login(email, password); // email을 uId로 전달
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

// 입력 필드 이벤트 리스너 등록
[emailInput, passwordInput, passwordConfirm.querySelector('input'), nickname.querySelector('input')].forEach(input => {
  if (input) {
    input.addEventListener('input', updateFormValidation);
    input.addEventListener('blur', updateFormValidation);
  }
});
