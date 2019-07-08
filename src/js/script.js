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

  goods.forEach(function (btn, i) {
    btn.addEventListener('click', () => {
      let cloneGoods = goods[i].cloneNode(true),
        trigger = cloneGoods.querySelector('button'),
        delGoodsButton = document.createElement('div'),
        empty = cartWrapper.querySelector('.empty');

      trigger.remove();

      delGoodsButton.classList.add('goods__item-remove')
      cloneGoods.appendChild(delGoodsButton);
      delGoodsButton.innerHTML = '&times;';

      cartWrapper.appendChild(cloneGoods);
      if (empty) {
        empty.remove();
      }
    });
  });

});
