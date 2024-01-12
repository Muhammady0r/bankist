'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const tempP = document.querySelector('.temp');

const usersApi = 'https://659e598b47ae28b0bd359f29.mockapi.io/api/v1/users/';
const transfersApi =
  'https://659e598b47ae28b0bd359f29.mockapi.io/api/v1/transfers';

// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   // movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,

//   movements: [
//     "200__2023-12-31T01:11:17.178Z",
//     "455.23__2024-01-01T07:42:02.383Z",
//     "-306.5__2024-01-02T09:15:04.904Z",
//     "25000__2024-01-03T10:17:24.185Z",
//     "-642.21__2024-01-04T14:11:59.604Z",
//     "-133.9__2024-01-05T17:01:17.194Z",
//     "79.97__2024-01-06T12:00:00.929Z",
//     "1300__2024-01-07T10:51:36.790Z",
//   ],
//   currency: 'EUR',
//   locale: 'pt-PT', // de-DE
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   // movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,

//   movements: [
//     "5000__2019-11-01T13:15:33.035Z",
//     "3400__2019-11-30T09:48:16.867Z",
//     "-150__2019-12-25T06:04:23.907Z",
//     "-790__2020-01-25T14:18:46.235Z",
//     "-3210__2020-02-05T16:33:06.386Z",
//     "-1000__2020-04-10T14:43:26.374Z",
//     "8500__2020-06-25T18:49:59.371Z",
//     "-30__2020-07-26T12:01:20.894Z",
//   ],
//   currency: 'USD',
//   locale: 'en-US',
// };

// const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnRegister = document.querySelector('.register__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const btns = [btnLogin, btnTransfer, btnLoan, btnClose];

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatDataN = (date, locale) =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).format(date);

const formatMoney = (money, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(money);

const formatMovDate = function (date, locale) {
  const calcDatePass = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const datePassed = calcDatePass(new Date(), date);

  if (datePassed === 0) return 'Сегодня';
  else if (datePassed === 1) return 'Вчера';
  else if (datePassed > 1 && datePassed < 8) return `${datePassed} дней назад`;
  else return formatDataN(date, locale);
};

const newMov = function (amount, user, isFrom) {
  return `${amount}__${new Date().toISOString()}__${
    isFrom ? 'Получено от' : 'Отправлено к'
  } ${user}`;
};

const getMov = function (mov) {
  return [
    +mov.split('__')[0],
    new Date(mov.split('__')[1]),
    mov.split('__')[2],
  ];
};

const displayMovements = function (id, sort = false) {
  containerMovements.innerHTML = '';

  fetch(usersApi + id, {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      // handle error
    })
    .then(acc => {
      const movs = sort
        ? acc.movements.slice().sort((a, b) => getMov(a)[0] - getMov(b)[0])
        : acc.movements;

      movs.forEach(function (mov, i) {
        const value = getMov(mov)[0];
        const date = getMov(mov)[1];
        const from = getMov(mov)[2];

        const type = value > 0 ? 'deposit' : 'withdrawal';

        const displayDate = formatMovDate(date, acc.locale);

        const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
          i + 1
        } ${type}</div>
        <div class="movements__date">${displayDate}    <p>${from}</p></div>
        <div class="movements__value">${formatMoney(
          value,
          acc.locale,
          acc.currency
        )}</div>
      </div>
    `;

        containerMovements.insertAdjacentHTML('afterbegin', html);
      });
    });
};

const calcDisplayBalance = function (id) {
  fetch(usersApi + id, {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      // handle error
    })
    .then(acc => {
      let blc = acc.movements.reduce((ac, mov) => {
        return ac + getMov(mov)[0];
      }, 0);
      if (blc == 0 && acc.movements.length == 0) {
        blc = 10;
        fetch(usersApi + id, {
          method: 'PUT', // or PATCH
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ movements: [newMov(blc, 'System', true)] }),
        });

        const transfer = {
          date: new Date().toISOString(),
          sender: 'System',
          receiver: acc.owner,
          value: blc,
        };

        fetch(transfersApi, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(transfer),
        }).then(res => {
          if (res.ok) {
            buttonStatus(this, 'cur');
            // Update UI
            updateUI(currentAccount);
            return res.json();
          }
          // handle error
        });
      }
      // console.log(blc);
      if (blc != acc.balance) {
        fetch(usersApi + id, {
          method: 'PUT', // or PATCH
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ balance: blc }),
        });
      }
      labelBalance.textContent = `${formatMoney(
        blc,
        acc.locale,
        acc.currency
      )}`;
    })
    .catch(error => {
      // handle error
    });
};

const calcDisplaySummary = function (id) {
  fetch(usersApi + id, {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      // handle error
    })
    .then(acc => {
      const incomes = acc.movements
        .filter(mov => getMov(mov)[0] > 0)
        .reduce((acc, mov) => acc + getMov(mov)[0], 0);
      labelSumIn.textContent = `${formatMoney(
        incomes,
        acc.locale,
        acc.currency
      )}`;

      const out = acc.movements
        .filter(mov => getMov(mov)[0] < 0)
        .reduce((acc, mov) => acc + getMov(mov)[0], 0);
      labelSumOut.textContent = `${formatMoney(
        Math.abs(out),
        acc.locale,
        acc.currency
      )}`;

      const interest = acc.movements
        .filter(mov => getMov(mov)[0] > 0)
        .map(deposit => {
          return (+deposit.split('__')[0] * acc.interestRate) / 100;
        })
        .filter(int => {
          return int >= 1;
        })
        .reduce((acc, int) => acc + int, 0);
      labelSumInterest.textContent = `${formatMoney(
        interest,
        acc.locale,
        acc.currency
      )}`;
    })
    .catch(error => {
      // handle error
    });
};

// const createUsernames = function (accs) {
//   accs.forEach(function (acc) {
//     acc.username = acc.owner
//       .toLowerCase()
//       .split(' ')
//       .map(name => name[0])
//       .join('');
//   });
// };
// createUsernames(accounts);

const updateUI = function () {
  // Display movements
  displayMovements(currentAccount);

  // Display balance
  calcDisplayBalance(currentAccount);

  // Display summary
  calcDisplaySummary(currentAccount);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

const setCurAcc = function (id) {
  currentAccount = id;
};

function showDate(locale) {
  const now = new Date();

  labelDate.textContent = formatDataN(now, locale);
}

const startLogOutTimer = function () {
  let time = 120;

  const startTimer = function () {
    const min = Math.floor(time / 60);
    const sec = time % 60;

    labelTimer.textContent = `${`${min}`.padStart(2, 0)}:${`${sec}`.padStart(
      2,
      0
    )}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Войдите что бы начать.';
      containerApp.style.opacity = 0;
    }

    time--;
  };

  startTimer();
  const timer = setInterval(startTimer, 1000);
  return timer;
};

const loginStatus = function (currect) {
  if (!currect) {
    inputLoginUsername.classList.add('incorrect');
    inputLoginPin.classList.add('incorrect');
  } else if (currect) {
    inputLoginUsername.classList.add('correct');
    inputLoginPin.classList.add('correct');
  }
  setTimeout(() => {
    inputLoginUsername.classList.remove('incorrect');
    inputLoginPin.classList.remove('incorrect');
    inputLoginUsername.classList.remove('correct');
    inputLoginPin.classList.remove('correct');
  }, 750);
};

const buttonStatus = function (btn, status = 'def') {
  const defaultS = `<i class="fa-duotone fa-arrow-right"></i>`;
  const loadingS = `<i class="fa-duotone fa-slash fa-spin-pulse"></i>`;
  const confirmS = `<i class="fa-solid fa-check"></i>`;
  const errorS = `<i class="fa-solid fa-xmark-large"></i>`;
  if (status == 'cur') {
    btn.innerHTML = confirmS;
    setTimeout(buttonStatus, 1000, btn);
  }
  if (status == 'err') {
    btn.innerHTML = errorS;
    setTimeout(buttonStatus, 1000, btn);
  }
  if (status == 'load') {
    btn.innerHTML = loadingS;
  }
  if (status == 'def') {
    btn.innerHTML = defaultS;
  }
};

btns.forEach(btn => {
  buttonStatus(btn);
});

let curClock;

const setCurClock = function (clock) {
  curClock = clock;
};

const overlay = document.querySelector('.overlay');
const lui = document.querySelector('.upper-lui');
const logBtn = lui.querySelector('.login-btn');
const regBtn = lui.querySelector('.register-btn');
const logF = lui.querySelector('.login');
const regF = lui.querySelector('.register');
const inputRegisterName = regF.querySelector('.register__input--user');
const inputRegisterUsername = regF.querySelector('.register__input--username');
// const inputRegisterInterRate = regF.querySelector(
//   '.register__input--interRate'
// );
const inputRegisterPin = regF.querySelector('.register__input--pin');

const openCloseLUI = function (open) {
  if (open) {
    overlay.classList.remove('hidden');
    lui.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
    lui.classList.add('hidden');
  }
};

document
  .querySelector('.nav__link--btn')
  .addEventListener('click', function (e) {
    e.preventDefault();
    openCloseLUI(true);
  });

regBtn.addEventListener('mousedown', function () {
  logF.style.display = 'none';
  regF.style.display = 'grid';
});

logBtn.addEventListener('click', function () {
  logF.style.display = 'grid';
  regF.style.display = 'none';
});

overlay.addEventListener('click', function () {
  openCloseLUI();
});

btnRegister.addEventListener('click', function (e) {
  e.preventDefault();
  const name = inputRegisterName.value;
  const username = inputRegisterUsername.value;
  // const interRate = +inputRegisterInterRate.value;
  const pin = inputRegisterPin.value;

  inputRegisterName.value =
    inputRegisterUsername.value =
    inputRegisterPin.value =
      '';

  buttonStatus(this, 'load');

  if (
    name.replaceAll(' ', '').length != 0 &&
    // interRate >= 1 &&
    // interRate <= 100 &&
    // !`${interRate}`.includes('.') &&
    username.length <= 16 &&
    username.length >= 2 &&
    !username.includes(' ') &&
    pin.length >= 4 &&
    pin.length <= 16
  ) {
    const user = {
      owner: name,
      // interestRate: interRate / 100,
      pin: pin,
      currency: 'USD',
      locale: navigator.language,
      username: username,
      movements: [],
      balance: -1,
    };

    fetch(usersApi, {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        // handle error
      })
      .then(accounts => {
        const isThere = accounts.some(acc => {
          return acc.username == username;
        });

        if (!isThere) {
          fetch(usersApi, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(user),
          }).then(res => {
            if (res.ok) {
              buttonStatus(this, 'cur');
              setTimeout(() => {
                logF.style.display = 'grid';
                regF.style.display = 'none';
              }, 1000);
              return res.json();
            } else {
              buttonStatus(this, 'err');
            }
          });
        } else {
          buttonStatus(this, 'err');
        }
      });
  } else {
    buttonStatus(this, 'err');
  }
});

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();
  buttonStatus(this, 'load');

  fetch(usersApi, {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
    })
    .then(accounts => {
      const acc = accounts.find(acc => {
        return acc.username == inputLoginUsername.value;
      });

      if (acc?.pin == inputLoginPin.value) {
        setCurAcc(acc.id);
        // Display UI and message
        labelWelcome.textContent = `Добро пожаловать, ${
          acc.owner.split(' ')[0]
        }`;
        containerApp.style.opacity = 100;

        if (curClock) clearInterval(curClock);
        showDate(acc.locale);
        const clock = setInterval(showDate, 1000, acc.locale);
        setCurClock(clock);

        if (timer) clearInterval(timer);
        timer = startLogOutTimer();

        loginStatus(true);

        buttonStatus(this, 'cur');

        setTimeout(openCloseLUI, 1000);

        // Update UI
        updateUI();
      } else {
        buttonStatus(this, 'err');
        loginStatus(false);
      }
    })
    .finally(() => {
      // Clear input fields
      inputLoginUsername.value = inputLoginPin.value = '';
      inputLoginPin.blur();
    });
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  buttonStatus(this, 'load');

  fetch(usersApi, {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      // handle error
    })
    .then(accounts => {
      const amount = +inputTransferAmount.value;
      const curAcc = accounts.find(acc => acc.id == currentAccount);
      const receiverAcc = accounts.find(
        acc => acc.username == inputTransferTo.value
      );
      // console.log(receiverAcc);
      inputTransferAmount.value = inputTransferTo.value = '';

      if (
        amount > 0 &&
        receiverAcc &&
        curAcc.balance >= amount &&
        receiverAcc?.username !== curAcc.username
      ) {
        // Doing the transfer

        const user1 = curAcc.movements;
        const user2 = receiverAcc.movements;

        user1.push(newMov(-amount, receiverAcc.owner, false));
        user2.push(newMov(amount, curAcc.owner, true));

        fetch(usersApi + currentAccount, {
          method: 'PUT', // or PATCH
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ movements: user1 }),
        }).then(res => {
          if (res.ok) {
            fetch(usersApi + receiverAcc.id, {
              method: 'PUT', // or PATCH
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ movements: user2 }),
            }).then(res => {
              if (res.ok) {
                const transfer = {
                  date: new Date().toISOString(),
                  sender: curAcc.owner,
                  receiver: receiverAcc.owner,
                  value: amount,
                };

                fetch(transfersApi, {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify(transfer),
                }).then(res => {
                  if (res.ok) {
                    buttonStatus(this, 'cur');
                    // Update UI
                    updateUI(currentAccount);
                    return res.json();
                  }
                  // handle error
                });
                return res.json();
              }
              buttonStatus(this, 'err');
            });
            return res.json();
          }
          buttonStatus(this, 'err');
        });

        clearInterval(timer);
        timer = startLogOutTimer();
      } else buttonStatus(this, 'err');
    })
    .catch(error => {
      // handle error
    });
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  buttonStatus(this, 'load');

  const amount = +inputLoanAmount.value;

  fetch(usersApi + currentAccount, {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      // handle error
    })
    .then(acc => {
      if (
        amount > 0 &&
        acc.movements.some(mov => getMov(mov)[0] >= amount * 0.1)
      ) {
        // Add movement

        const curMovs = acc.movements;
        curMovs.push(newMov(amount, 'System', true));

        fetch(usersApi + acc.id, {
          method: 'PUT', // or PATCH
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ movements: curMovs }),
        }).then(res => {
          if (res.ok) {
            const transfer = {
              date: new Date().toISOString(),
              sender: 'System',
              receiver: acc.owner,
              value: amount,
            };

            fetch(transfersApi, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(transfer),
            }).then(res => {
              if (res.ok) {
                buttonStatus(this, 'cur');
                // Update UI
                updateUI(currentAccount);
                return res.json();
              }
              // handle error
            });
            return res.json();
          }
          // handle error
        });
      } else buttonStatus(btnLoan, 'err');
    })
    .catch(error => {
      // handle error
    });

  clearInterval(timer);
  timer = startLogOutTimer();
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  buttonStatus(this, 'load');

  fetch(usersApi + currentAccount, {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }
      // handle error
    })
    .then(acc => {
      if (
        inputCloseUsername.value == acc.username &&
        inputClosePin.value == acc.pin
      ) {
        fetch(usersApi + acc.id, {
          method: 'DELETE',
        }).then(res => {
          if (res.ok) {
            buttonStatus(this, 'cur');

            return res.json();
          }
          // handle error
        });

        // const index = accounts.findIndex(acc => acc.username === acc.username);
        // console.log(index);
        // // .indexOf(23)

        // clearInterval(timer);

        // // Delete account
        // accounts.splice(index, 1);

        // Hide UI
        containerApp.style.opacity = 0;
      } else buttonStatus(this, 'err');
    })
    .finally(() => {
      inputCloseUsername.value = inputClosePin.value = '';
    });
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
