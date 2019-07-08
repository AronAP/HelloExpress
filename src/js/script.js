window.addEventListener('DOMContentLoaded', () => {

  const cart = document.querySelector('.cart'),
    total = document.querySelector('.cart__total > span'),
    cartWrapper = document.querySelector('.cart__wrapper'),
    closeCartButton = document.querySelector('.cart__close'),
    cartButton = document.querySelector('#cart'),
    cartBadge = document.querySelector('.nav__badge'),
    goods = document.querySelectorAll('.goods__item'),
    goodsTitle = document.querySelectorAll('.goods__title'),
    goodsButton = document.querySelectorAll('.goods__btn'),
    confirm = document.querySelector('.confirm');

  function openCart() {
    cart.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cart.style.display = 'none';
    document.body.style.overflow = '';
  }

  cartButton.addEventListener('click', openCart);

  closeCartButton.addEventListener('click', closeCart);

  goodsButton.forEach(function (btn, i) {
    btn.addEventListener('click', () => {
      let cloneGoods = goods[i].cloneNode(true),
        trigger = cloneGoods.querySelector('button'),
        delGoodsButton = document.createElement('div'),
        empty = cartWrapper.querySelector('.empty');

      trigger.remove();

      confirmAnimate();

      delGoodsButton.classList.add('goods__item-remove');
      cloneGoods.appendChild(delGoodsButton);
      delGoodsButton.innerHTML = '&times;';

      cartWrapper.appendChild(cloneGoods);
      if (empty) {
        empty.remove();
      }

      calcBadge();
      calcTotal();
      removeGoods();
    });
  });

  function sliceTitle() {

    goodsTitle.forEach(function (str) {

      if (str.textContent.length <= 70) {
        return;
      } else {
        const newStr = `${str.textContent.slice(0, 71)}...`;
        str.textContent = newStr;
      }

    });

  }
  sliceTitle();

  function confirmAnimate() {
    confirm.style.display = 'block';
    let counter = 100;

    const timer = setInterval(() => {
      if (counter >= 11) {
        counter--;
        confirm.style.transform = `translateY(-${counter}px)`;
        confirm.style.opacity = `.${counter}`;
      } else {
        clearInterval(timer);
        confirm.style.display = 'none';
      }
    }, 1);
  }

  function calcBadge() {
    let numGoods = cartWrapper.querySelectorAll('.goods__item');

    cartBadge.textContent = numGoods.length;

    if (numGoods.length == 0) {
      let newEmpty = document.createElement('div');

      newEmpty.classList.add('empty');
      newEmpty.innerHTML = 'Ваша корзина опять пуста';
      cartWrapper.appendChild(newEmpty);
    }
  }

  function calcTotal() {
    const priceGoods = document.querySelectorAll('.cart__wrapper > .goods__item > .goods__price > span');
    let totalPrice = 0;

    priceGoods.forEach(function (price) {
      totalPrice += +price.textContent;
    });
    total.textContent = totalPrice;
  }

  function removeGoods() {
    const removeGoodsButton = cartWrapper.querySelectorAll('.goods__item-remove');

    removeGoodsButton.forEach(function (close) {
      close.addEventListener('click', () => {
        close.parentElement.remove();

        calcBadge();
        calcTotal();
      });
    });
  }
});
