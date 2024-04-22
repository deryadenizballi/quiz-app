var quiz = {

  quizWrap: null,
  quizQuestion: null,
  quizAnswer: null,
  quizTable: null,
  quizAction: null,
  coutdown: null,
  quizQuestionCont: null,
  countdownInterval: null,
  questions: [],
  firstTime: 10,
  questionTime: 30,
  totalQuestion: 10,
  now: 0,

  init: () => {
    quiz.quizWrap = document.getElementById("quiz-wrap");
    quiz.quizTable = document.getElementById("quiz-table");
    quiz.coutdown = document.querySelector('.quiz-coutdown');
    quiz.quizAction = document.querySelector('.quiz-action');
    quiz.quizQuestionCont = document.querySelector('.quiz-question-count');

    quiz.quizQuestion = document.createElement("div");
    quiz.quizQuestion.id = "quiz-question";
    quiz.quizWrap.appendChild(quiz.quizQuestion);

    quiz.quizAnswer = document.createElement("div");
    quiz.quizAnswer.id = "quiz-answer";
    quiz.quizWrap.appendChild(quiz.quizAnswer);

    quiz.getQuestion();
    quiz.nextQuestion();
    quiz.renderQuestionCount();
  },
  getQuestion: () => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((data) => {
        const randomData = quiz.getRandomElements(data, quiz.totalQuestion);
        randomData.forEach((dataItem, index) => {
          quiz.questions.push({
            question: `${(index + 1)}-) ${dataItem.body}`,
            options: quiz.splitWords(dataItem.body),
            answer: quiz.getRandomNumber(),
          });
        });

        quiz.draw();
      });
  },
  getRandomElements: (arr, numElements) => {
    const randomElements = [];
    const arrayLength = arr.length;

    // İstenen eleman sayısına kadar rastgele indeksler üretip elemanları seçme
    for (let i = 0; i < numElements; i++) {
      const randomIndex = Math.floor(Math.random() * arrayLength);
      randomElements.push(arr[randomIndex]);
    }

    return randomElements;
  },
  getRandomNumber: () => {
    return Math.floor(Math.random() * 3) + 1;
  },
  splitWords: (string) => {
    const words = string.split(" ");
    const wordCount = words.length;
    if (wordCount < 4) {
      return [];
    }
    const index = Math.floor(Math.random() * (wordCount - 3));
    const selectedWords = [];
    for (let i = index; i < index + 4; i++) {
      selectedWords.push(words[i]);
    }

    return selectedWords;
  },
  startQuizTimer: () => {
    quiz.coutdown.innerHTML = quiz.questionTime;
    let count = quiz.questionTime;

    // Bir saniyede bir azaltmak için bir aralık oluştur
    quiz.countdownInterval = setInterval(function() {
      count--;
      quiz.coutdown.innerHTML = count;

      if (count === 0) {
        clearInterval(quiz.countdownInterval);
        quiz.now++;
        if (quiz.now < quiz.questions.length) {
          quiz.draw();
        }
        else{
          quiz.quizModalShow();
          quiz.alertMessage("success", "Sınav tamamlanmıştır");
        }
      }
    }, 1000);
  },
  draw: () => {
    quiz.startQuizTimer();

    quiz.renderQuestionCount();

    quiz.quizQuestion.innerHTML = quiz.questions[quiz.now].question;

    quiz.quizAnswer.innerHTML = "";
    for (let i in quiz.questions[quiz.now].options) {
      let radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "quiz";
      radio.id = "quizo" + i;
      quiz.quizAnswer.appendChild(radio);
      let label = document.createElement("label");
      label.innerHTML = quiz.questions[quiz.now].options[i];
      label.setAttribute("for", "quizo" + i);
      label.dataset.idx = i;

      let isClickable = true;

      setTimeout(() => {
        isClickable = false;
      }, (quiz.firstTime * 1000));

      label.addEventListener("click", () => {
        if (!isClickable) {
          quiz.select(label, quiz.questions[quiz.now]);
          clearInterval(quiz.countdownInterval);
        } else {
          quiz.alertMessage('error', `${quiz.firstTime} saniye geçtikten sonra cevap verilebilir`)
        }
      });
      quiz.quizAnswer.appendChild(label);
    }
  },
  select: (option, currentQuiz) => {

    let all = quiz.quizAnswer.getElementsByTagName("label");
    for (let label of all) {
      label.removeEventListener("click", quiz.select);
    }

    let questionClass = '';
    let correct = option.dataset.idx == quiz.questions[quiz.now].answer;
    if (correct) {
      questionClass = 'correct';
    } else {
      questionClass = 'wrong';
    }

    option.classList.add(questionClass);

    const tr = `
      <tr class="${questionClass}">
      <td>${quiz.now + 1}</td>
        <td>${currentQuiz.question}</td>
        <td>${option.innerText}</td>
        <td>${currentQuiz.options[currentQuiz.answer]}</td>
      </tr>
    `;

    const tableBody = quiz.quizTable.querySelector('tbody');
    if(tableBody){
      tableBody.innerHTML += tr;
    }

    quiz.now++;

    setTimeout(() => {
      if (quiz.now < quiz.questions.length) {
        quiz.draw();
      } 
      else {
        quiz.quizModalShow();

        document.getElementById('restart-quiz').addEventListener('click', () => {
          window.location.reload();
        })
      }
    }, 1000);
  },
  nextQuestion: () => {
    quiz.quizAction.addEventListener("click", () => {
      quiz.now++;
      quiz.draw(); 
    })
  },
  renderQuestionCount: () => {
    if (quiz.now < quiz.questions.length) {
      quiz.quizQuestionCont.innerHTML = `${quiz.now + 1}/${quiz.totalQuestion}`;
    }
  },
  reset: () => {
    quiz.now = 0;
    quiz.draw();
    clearInterval(quiz.countdownInterval);
  },
  quizModalShow: () => {
    const quizTableModal = new bootstrap.Modal(document.getElementById('quiz-table-modal'));
    quizTableModal.show();
    quiz.quizTable.classList.add('show');
  },
  alertMessage: (status, message) => {
    Swal.fire({
      position: "top-end",
      icon: status,
      title: message,
      showConfirmButton: false,
      timer: 1500
    });
  }
};

window.addEventListener("load", quiz.init);
