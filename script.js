const startBtn = document.querySelector('.start-slide__form-btn');
const endBtn = document.querySelector('.btn__game-over');
const restartBtn = document.querySelector('.end-slide__btn');
const checkBtn = document.querySelector('.game-slide__check-btn');
const helpBtn = document.querySelectorAll('.btn-help__item');

const questions = document.querySelectorAll('.question');
const startSlide = document.querySelector('.start-slide');
const gameSlide = document.querySelector('.game-slide');
const endSlide = document.querySelector('.end-slide');
const slides = [startSlide, gameSlide, endSlide];

const correctAnswers = ['Можно во всех перечисленных', 'for, while, do while',
  'if (i == 2)', 'Сравнивает без приведения типа', 'Никакая из вышеперечисленных'
];

let countSlide = 1;
let countQuestion = 0;
let moneyWon = 0;
let moneyQuestion;
let timer;
let seconds = 60;
let userName;


startBtn.addEventListener('click', checkFormValue);
checkBtn.addEventListener('click', checkResult);
endBtn.addEventListener('click', switchSlide);
restartBtn.addEventListener('click', switchSlide);


function checkFormValue() {
  let form = document.querySelector('.start-slide__form-input');
  userName = form.value;
  const regex = /^[A-Za-zА-Яа-я]{2,12}([A-Za-zа-я]{0,1})?([a-zа-я]{0,2})?$/;

  if (regex.test(form.value)) {
    switchSlide();
  } else {
    let error = document.createElement('p');
    error.className = 'error';
    slides[0].prepend(error);
    error.textContent = 'Имя должно содержать только буквы русского или латинского алфавита';
    setTimeout(() => error.remove(), 3000);
  }

  form.value = '';
}


function switchSlide() {
  if (countSlide === 1) {
    showMoneyQuestion(0);
    showTimerQuestions();
  }

  if (countSlide === 2) {
    showMoneyWon();
    clearTimeout(timer);
    seconds = 60;
  }

  if (countSlide === 3) {
    restart();
  }

  slides.forEach(slide => slide.classList.remove('active'));
  slides[countSlide].classList.add('active');

  countSlide++;
}


function assignHendlerHelpBtn() {
  Array.from(helpBtn).forEach(item => item.addEventListener('click', showTrueAnswers));
}

assignHendlerHelpBtn();


function showTimerQuestions() {
  let timerQuestion = document.querySelector('.game-slide__timer');
  timerQuestion.textContent = seconds;
  seconds--;

  if (seconds === 0) {
    clearTimeout(timer);
    switchSlide();
  } else {
    timer = setTimeout(showTimerQuestions, 1000);
  }
}


function switchQuestion() {
  questions[countQuestion].classList.remove('question-active');
  questions[countQuestion + 1].classList.add('question-active');

  countQuestion++;
  clearTimeout(timer);
  seconds = 60;
}


function checkResult() {
  let thisAnswers = questions[countQuestion].querySelectorAll('.answer__radio');
  let userAnswer = Array.from(thisAnswers).filter(answer => answer.checked)[0];
  if (!userAnswer) return;

  if (correctAnswers.includes(userAnswer.value)) {
    moneyWon = moneyWon + moneyQuestion;
    showMoneyQuestion(countQuestion + 1);

    if (countQuestion === 4) {
      switchSlide();
      return;
    } else {
      switchQuestion();
      showTimerQuestions();
    }
  } else switchSlide();

  Array.from(thisAnswers).forEach(radio => radio.setAttribute('disabled', 'disabled'));
}


function showMoneyQuestion(num) {
  switch (questions[num]) {
    case questions[0]:
      moneyQuestion = 10000;
      break;
    case questions[1]:
      moneyQuestion = 30000;
      break;
    case questions[2]:
      moneyQuestion = 50000;
      break;
    case questions[3]:
      moneyQuestion = 100000;
      break;
    case questions[4]:
      moneyQuestion = 500000;
      break;
  }

  let gameCash = document.querySelector('.game-slide__cash');
  gameCash.textContent = `Сумма вопроса - ${moneyQuestion} рублей`;
}


function showTrueAnswers(event) {
  let target = event.target;
  let thisAnswers = document.querySelectorAll('.question-active .question__answers .answer__radio');
  let falseAnswers = Array.from(thisAnswers).filter(answer => !correctAnswers.includes(answer.value));
  let randomNum = function() {
    return Math.floor(Math.random() * 3);
  }

  let firstRandomNum = randomNum();
  let secondRandomNum;
  do {
    secondRandomNum = randomNum();
  } while (firstRandomNum === secondRandomNum)

  if (Array.from(target.classList).includes('btn-help__item_opinion-audience')) {
    falseAnswers[randomNum()].setAttribute('disabled', 'disabled');
  } else {
    falseAnswers[firstRandomNum].setAttribute('disabled', 'disabled');
    falseAnswers[secondRandomNum].setAttribute('disabled', 'disabled');
  }

  target.removeEventListener('click', showTrueAnswers);
  target.style.opacity = '0';
}


function showMoneyWon() {
  let allMoneyWon = document.querySelector('.end-slide__title');
  allMoneyWon.textContent = `${userName}, ваша игра закончена, ваш выигрыш: ${moneyWon} рублей`;
}


function restart() {
  countSlide = 0;
  countQuestion = 0;
  moneyWon = 0;

  Array.from(helpBtn).forEach(btn => btn.style.opacity = '1');
  assignHendlerHelpBtn();

  Array.from(document.querySelectorAll('.answer__radio'))
    .forEach(radio => {
      radio.removeAttribute('disabled');
      radio.checked = false;
    });

  Array.from(questions).forEach(item => item.classList.remove('question-active'));
  questions[0].classList.add('question-active');
}
