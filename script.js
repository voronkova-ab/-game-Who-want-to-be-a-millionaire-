const startBtn = document.querySelector('.start-slide__form-btn');
const endBtn = document.querySelector('.btn__game-over');
const restartBtn = document.querySelector('.end-slide__btn');
const checkBtn = document.querySelector('.game-slide__check-btn');
const helpBtn = document.querySelectorAll('.btn-help__item');

const questions = document.querySelectorAll('.question');
const questionsContainer = document.querySelector('.game-slide__questions');
const startSlide = document.querySelector('.start-slide');
const gameSlide = document.querySelector('.game-slide');
const endSlide = document.querySelector('.end-slide');
const slides = [startSlide, gameSlide, endSlide];

let requestCorrectAnswers = [];
const correctAnswers = ['Можно во всех перечисленных', 'for, while, do while',
  'if (i == 2)', 'Сравнивает без приведения типа', 'Никакая из вышеперечисленных'];

let countSlide = 1;
let countQuestion = 0;
let moneyWon = 0;
let moneyQuestion;
let timer;
let seconds = 60;
let userName;
let secondRandomNum;
let firstRandomNum;

const requestUrl = 'https://opentdb.com/api.php?amount=5&type=multiple';
const preloader = document.querySelector('.preloader');


startBtn.addEventListener('click', checkFormValue);
checkBtn.addEventListener('click', checkResult);
endBtn.addEventListener('click', switchSlide);
restartBtn.addEventListener('click', switchSlide);


function sendRequest(url) {
  return new Promise((resolve,reject) => {
    let request = new XMLHttpRequest();

    request.open('GET', url);

    request.responseType = 'json';

    let error = new Error('Ошибка при получении вопросов');

    request.onload = () => {
      if (request.status >= 400) {
        reject(error);
      } else {
        resolve(request.response);
        preloader.classList.add('none');
      }
    };

    request.onerror = () => reject(error);

    request.send();
  });
}


function processRequest() {
  sendRequest(requestUrl)
    .then(response => {
      let result = response.results;

      let requestQuestions = result.map(item => item.question);
      requestCorrectAnswers = result.map(item => item.correct_answer);
      let requestAllAnswers = result.map(item => [...item.incorrect_answers, item.correct_answer]);
      let questionsText = document.querySelectorAll('.question__text');
      let answersText = Array.from(questions).map(item => item.querySelectorAll('.answer__text'));
      insertTextQuestions(questionsText, requestQuestions);
      insertTextAnswers(answersText, requestAllAnswers);
    })
    .catch(err => {
      console.log(err);
      preloader.classList.add('none');
    });
}

processRequest();


function insertTextQuestions(defaultQuestions, requestQuestions) {
  let textRequestQuestions = requestQuestions.map(item => removeExtraCharacters(item));

  Array.from(defaultQuestions).forEach((item, index) => {
    item.textContent = textRequestQuestions[index];
  });
}


function insertTextAnswers(defaultAnswers, requestAnswers) {
    let textRequestAnswers = requestAnswers.map(item => item.map(item => removeExtraCharacters(item)));

    let a, b, c, d;
    function getRandomAnswerNumber() {
        a = getRandomNumber(4);

        do {
          b = getRandomNumber(4);
        } while (b === a)

        do {
          c = getRandomNumber(4);
        } while (c === b || c === a)

        do {
          d = getRandomNumber(4);
        } while (d === b || d === a || d === c)
    }

    defaultAnswers.forEach((arr, index) => {
        getRandomAnswerNumber();
        arr[a].textContent = textRequestAnswers[index][0];
        arr[b].textContent = textRequestAnswers[index][1];
        arr[c].textContent = textRequestAnswers[index][2];
        arr[d].textContent = textRequestAnswers[index][3];

        arr[a].previousElementSibling.value = textRequestAnswers[index][0];
        arr[b].previousElementSibling.value = textRequestAnswers[index][1];
        arr[c].previousElementSibling.value = textRequestAnswers[index][2];
        arr[d].previousElementSibling.value = textRequestAnswers[index][3];
    });
  }


function makeQuestionsConteinerHeight(question) {
  questionsContainer.style.height = question.offsetHeight + 'px';
}


function removeExtraCharacters(string) {
  return string.replace(/&quot;/g, `'`)
               .replace(/&#039;/g, '`')
               .replace(/&rsquo;/g, `'`)
               .replace(/&ldquo;/g, `'`)
               .replace(/&uacute;/g, `Ú`)
               .replace(/&eacute;/g, 'É')
               .replace(/&amp;/g, '&')
               .replace(/&ouml;/g, 'Ö')
               .replace(/&Uuml;/g, 'Ü');
}


function checkFormValue() {
  let form = document.querySelector('.start-slide__form-input');
  userName = form.value;
  const regex = /^[A-Za-zА-Яа-я]{2,12}([A-Za-zа-я]{0,1})?([a-zа-я]{0,2})?$/;

  if (regex.test(form.value)) {
    switchSlide();
  } else {
    let error = document.createElement('p');
    error.className = 'error';
    document.querySelector('.content').prepend(error);
    error.textContent = 'Имя должно содержать только буквы русского или латинского алфавита';
    setTimeout(() => error.remove(), 10000);
  }

  form.value = '';
}


function switchSlide() {
  if (countSlide === 1) {
    makeQuestionsConteinerHeight(questions[0]);
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

  makeQuestionsConteinerHeight(questions[countQuestion + 1]);

  countQuestion++;
  clearTimeout(timer);
  seconds = 60;
}


function checkResult() {
  let thisAnswers = questions[countQuestion].querySelectorAll('.answer__radio');
  let userAnswer = Array.from(thisAnswers).filter(answer => answer.checked)[0];
  if (!userAnswer) return;

  if (correctAnswers.includes(userAnswer.value) || requestCorrectAnswers.includes(userAnswer.value)) {
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
  let falseAnswers = Array.from(thisAnswers).filter(answer => {
    let falseAnswers = !correctAnswers.includes(answer.value) && !requestCorrectAnswers.includes(answer.value);
    return falseAnswers && !answer.hasAttribute('disabled');
  });

  let isBtnFiftyFifty = Array.from(target.classList).includes('btn-help__item_fifty-fifty');
  const makeDisabled = num => falseAnswers[num].setAttribute('disabled', 'disabled');

  if (isBtnFiftyFifty) {
      generateTwoNumber();

      makeDisabled(firstRandomNum);
      makeDisabled(secondRandomNum);
   } else showModal(target.classList[1], thisAnswers);

  target.removeEventListener('click', showTrueAnswers);
  target.style.opacity = '0';
}


function generateTwoNumber() {
  firstRandomNum = getRandomNumber(3);
  do {
    secondRandomNum = getRandomNumber(3);
  } while (firstRandomNum === secondRandomNum)
}


function showModal(classBtn, allAnswers) {
  const modal = document.querySelector('.modal');
  const modalTitle = document.querySelector('.modal__title');
  const modalAnswer = document.querySelector('.modal__answer');

  modal.classList.add('modal-active');
  gameSlide.classList.add('content-blur');

  let activeAnswers = Array.from(allAnswers).filter(item => !item.hasAttribute('disabled'));

  if (classBtn === 'btn-help__item_opinion-audience') {
    modalTitle.textContent = 'Зал считает, что верный ответ:';
    modalAnswer.textContent = `${activeAnswers[getRandomNumber(activeAnswers.length)].value}`;
  } else {
    let correctAnswer = Array.from(allAnswers).filter(item => correctAnswers.includes(item.value))
                        && Array.from(allAnswers).filter(item => requestCorrectAnswers.includes(item.value));

    let falseAnswers = activeAnswers.filter(item => item.value !== correctAnswer[0].value);
    let answerProbabilityHalf = getRandomNumber(2);
    
    if (answerProbabilityHalf) {
          modalAnswer.textContent = `${correctAnswer[0].value}`;
        } else {
          modalAnswer.textContent = `${falseAnswers[getRandomNumber(falseAnswers.length)].value}`;
        }

        modalTitle.textContent = 'Ваш друг считает, что верный ответ:';
    }


  const modalCloseBtn = document.querySelector('.modal__close-btn');
  modalCloseBtn.onclick = () => {
    modal.classList.remove('modal-active');
    gameSlide.classList.remove('content-blur');
  }
}


function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}


function showMoneyWon() {
  let allMoneyWon = document.querySelector('.end-slide__title');
  allMoneyWon.textContent = `${userName}, ваша игра закончена, ваш выигрыш: ${moneyWon} рублей`;
}


function restart() {
  countSlide = 0;
  countQuestion = 0;
  moneyWon = 0;
  requestCorrectAnswers = [];

  Array.from(helpBtn).forEach(btn => btn.style.opacity = '1');
  assignHendlerHelpBtn();

  Array.from(document.querySelectorAll('.answer__radio'))
    .forEach(radio => {
      radio.removeAttribute('disabled');
      radio.checked = false;
    });

  Array.from(questions).forEach(item => item.classList.remove('question-active'));
  questions[0].classList.add('question-active');
  preloader.classList.remove('none');
  processRequest();
}
