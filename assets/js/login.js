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

function toggleSignupMode(e) {
  if (e) e.preventDefault();

  const isLoginMode = submitButton.textContent === '로그인';

  // 1단계: 버튼 텍스트 변경
  submitButton.textContent = isLoginMode ? '가입하기' : '로그인';
  signupBox.innerHTML = isLoginMode
    ? '계정이 있으신가요? <a href="#" id="signupLink">로그인</a>'
    : '계정이 없으신가요? <a href="#" id="signupLink">가입하기</a>';

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

// 이벤트 리스너
signupLink.addEventListener('click', toggleSignupMode);

// 버튼 상태 업데이트 함수
function updateButtonState() {
  const isSignupMode = submitButton.textContent === '가입하기';
  const requiredInputs = isSignupMode
    ? [
        emailInput,
        passwordInput,
        passwordConfirm.querySelector('input'),
        nickname.querySelector('input'),
      ]
    : [emailInput, passwordInput];

  const isValid = requiredInputs.every(input => input && input.value.length > 0);
  if (isValid) {
    submitButton.classList.add('active');
  } else {
    submitButton.classList.remove('active');
  }
}

// 모든 입력 필드에 이벤트 리스너 추가
[
  emailInput,
  passwordInput,
  passwordConfirm.querySelector('input'),
  nickname.querySelector('input'),
].forEach(input => {
  if (input) {
    input.addEventListener('input', updateButtonState);
  }
});
