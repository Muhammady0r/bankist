const transfersApi =
  'https://659e598b47ae28b0bd359f29.mockapi.io/api/v1/transfers';

const usersApi = 'https://659e598b47ae28b0bd359f29.mockapi.io/api/v1/users/';

const transDiv = document.querySelector('.transfers');

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

  if (datePassed === 0) return 'Today';
  else if (datePassed === 1) return 'Yesterday';
  else if (datePassed > 1 && datePassed < 8) return `${datePassed} days ago`;
  else return formatDataN(date, locale);
};

fetch(transfersApi, {
  method: 'GET',
  headers: { 'content-type': 'application/json' },
})
  .then(res => {
    if (res.ok) {
      transDiv.innerHTML = '';
      return res.json();
    }
  })
  .then(transfers => {
    transfers.forEach(trans => {
      const html = `<div class="transfer">
        <p class="date">${formatMovDate(new Date(trans.date), 'en-UK')}</p>
        <div>
          <b class="sender">${trans.sender}</b>
          <i class="fa-duotone fa-right"></i>
          <p class="amount">${formatMoney(trans.value, 'en-US', 'USD')}</p>
          <i class="fa-duotone fa-right"></i>
          <b class="receiver">${trans.receiver}</b>
        </div>
      </div>`;

      transDiv.insertAdjacentHTML('afterbegin', html);
    });
  });
