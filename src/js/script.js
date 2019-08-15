'use strict';

window.addEventListener('DOMContentLoaded', () => {

  /**
   * Подгружает данные на страницу с помощью fetch
   *
   * @param {*} url - ссылка на базу данных
   * @param {*} callback - функция для работы с элементами на странице
   */
  const loadContent = async (url, callback) => { // функция для вызова базы данных и всех остальных функций
    await fetch(url) // promise: пока фетч не загрузиться ПОЛНОСТЬЮ
      .then(response => response.json()) // promise: получаем ответ и преврати json в javascript объект
      .then(json => makeElement(json.goods)); // используй код в функции

    callback(); // вызови функцию после ПОЛНОЙ загрузки фетч
  };

  /**
   * Формирует карточку с товаром и добавляет её на страницу
   *
   * @param {*} arr - массив данных, сформированный из базы данных
   */
  function makeElement(arr) {
    const goodsWrapper = document.querySelector('.goods__wrapper');

    arr.forEach(item => {
      let newBlock = document.createElement('div');

      newBlock.classList.add('goods__item');
      newBlock.innerHTML = `
            <img class="goods__img" src="${item.url}" alt="phone">
            <div class="goods__colors">Доступно цветов: 4</div>
            <div class="goods__title">${item.title}</div>
            <div class="goods__price">
                <span>${item.price}</span> грн/шт
            </div>
            <button class="goods__btn">Добавить в корзину</button>
            <div class="goods__like">
              <svg width="25" height="25" xmlns="http://www.w3.org/2000/svg"
                  xmlns:svg="http://www.w3.org/2000/svg">
                  <path
                      d="m12.38012,6.63838c4.60578,-13.23323 22.65142,
                      0 0,17.01416c-22.65142,-17.01416 -4.60578,-30.24739 0,-17.01416z" />
              </svg>
            </div>
          `;
      goodsWrapper.appendChild(newBlock);
    });

  }

  loadContent('js/db.json', () => {

    const cart = document.querySelector('.cart'),
      like = document.querySelector('.like'),
      cartWrapper = document.querySelector('.cart__wrapper'),
      likeWrapper = document.querySelector('.like__wrapper'),
      total = document.querySelector('.cart__total > span'),
      countLike = document.querySelector('.like__count > span'),
      closeCartButton = document.querySelector('.cart__close'),
      closeLikeList = document.querySelector('.like__close'),
      cartButton = document.querySelector('#cart'),
      likeListButton = document.querySelector('#like'),
      cartBadge = document.querySelector('.nav__badge'),
      goods = document.querySelectorAll('.goods__item'),
      goodsTitle = document.querySelectorAll('.goods__title'),
      goodsButton = document.querySelectorAll('.goods__btn'),
      likeButton = document.querySelectorAll('.goods__like'),
      likePicButton = document.querySelectorAll('.goods__like > svg'),
      confirm = document.querySelector('.confirm'),
      cartConfirm = document.querySelector('.cart__confirm'),
      emptyCart = cartWrapper.querySelector('.empty'),
      emptyLike = likeWrapper.querySelector('.empty');

    /**
     * Показывает модальное окно
     *
     * @param {*} modal - модальное окно, которое нужно открыть
     * @param {*} removeFunc - функция для удаления добавленных товаров из модального окна
     */
    function open(modal, removeFunc) {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      removeFunc();
    }

    cartButton.addEventListener('click', function () {
      open(cart, removeCartGoods);
    });

    likeListButton.addEventListener('click', function () {
      open(like, removeLikesGoods);
    });

    /**
     * Скрывает модальное окно
     *
     * @param {*} modal - модальное окно, которое нужно скрыть
     */
    function close(modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    closeCartButton.addEventListener('click', function () {
      close(cart);
    });
    closeLikeList.addEventListener('click', function () {
      close(like);
    });

    // ДОБАВЛЕНИЕ ТОВАРОВ В КОРЗИНУ
    goodsButton.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        let cloneGoods = goods[i].cloneNode(true),
          trigger = cloneGoods.querySelector('button'),
          triggerLike = cloneGoods.querySelector('.goods__like'),
          delGoodsButton = document.createElement('div');

        trigger.remove();
        triggerLike.remove();

        confirmAnimate({
          duration: 1000,
          timing: function (timeFraction) {
            return timeFraction;
          },
          draw: function (progress) {
            if (progress >= 0) {
              confirm.style.opacity = `${(progress * -1) + 1}`;
              confirm.style.transform = `translateY(${(progress * 150)}px)`;
            }
          },
        });

        delGoodsButton.classList.add('goods__item-remove');
        cloneGoods.appendChild(delGoodsButton);
        delGoodsButton.innerHTML = '&times;';

        cartWrapper.appendChild(cloneGoods);

        if (emptyCart) {
          emptyCart.style.display = 'none';
        }

        countGoods(cartWrapper, cartBadge, emptyCart);
        calcTotalPrice();
      });
    });

    /**
     * Обрезает заголовки в карточках товаров
     *
     */
    function sliceTitle() {

      goodsTitle.forEach(str => {

        if (str.textContent.length <= 49) {
          return;
        } else {
          const newStr = `${str.textContent.slice(0, 49)}...`;
          str.textContent = newStr;
        }

      });

    }
    sliceTitle();

    /**
     * Анимация при добавлении товаров в корзину
     *
     * @param {*} options - параметры для анимации
     */
    function confirmAnimate(options) {
      confirm.style.display = 'block';

      let start = performance.now();

      requestAnimationFrame(function animate(time) {
        // timeFraction от 0 до 1
        let timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        // текущее состояние анимации
        let progress = options.timing(timeFraction);

        options.draw(progress);

        if (timeFraction < 1) {
          requestAnimationFrame(animate);
        }

      });
    }

    /**
     * Подсчитывает число товаров в модальном окне
     *
     * @param {*} wrapper - обертка для товаров
     * @param {*} countSpan - блок, с числом товаров
     * @param {*} emptyBlock - блок с надписью "пусто"
     */
    function countGoods(wrapper, countSpan, emptyBlock) {
      let numGoods = wrapper.querySelectorAll('.goods__item');

      countSpan.textContent = numGoods.length;

      if (numGoods.length == 0) {
        emptyBlock.style.display = 'block';
      }
    }

    /**
     * Подсчитывает общую стоимость товаров
     *
     */
    function calcTotalPrice() {
      const priceGoods = document.querySelectorAll('.cart__wrapper > .goods__item > .goods__price > span');
      let totalPrice = 0;

      priceGoods.forEach(price => {
        totalPrice += +price.textContent;
      });
      total.textContent = totalPrice;
    }

    /**
     * Удаляет товары с корзины
     *
     */
    function removeCartGoods() {
      const removeGoodsButton = cartWrapper.querySelectorAll('.goods__item-remove');

      removeGoodsButton.forEach(close => {
        close.addEventListener('click', () => {
          close.parentElement.remove();

          countGoods(cartWrapper, cartBadge, emptyCart);
          calcTotalPrice();
        });
      });
    }

    // Показать/скрыть кнопку "Добавить в избранное"
    goods.forEach(item => {
      const likeBtn = item.querySelector('.goods__like');

      item.addEventListener('mouseover', () => {
        likeBtn.style.visibility = 'visible';
      });

      item.addEventListener('mouseout', () => {
        likeBtn.style.visibility = 'hidden';
      });
    });

    // ДОБАВЛЕНИЕ ТОВАРОВ В ИЗБРАННОЕ
    likeButton.forEach((btn, i) => {

      let svg = likePicButton[i];
      svg.style.fill = 'none';

      btn.addEventListener('mouseover', () => {
        svg.style.strokeOpacity = '1';
        btn.style.boxShadow = '1px 1px 5px rgba(0, 0, 0, 0.4)';
      });

      btn.addEventListener('mouseout', () => {
        svg.style.strokeOpacity = '.7';
        btn.style.boxShadow = '1px 1px 5px rgba(0, 0, 0, 0.2)';
      });

      btn.addEventListener('click', () => {

        svg.style.fill = (svg.style.fill == 'none') ? 'rgb(220, 62, 42)' : 'none';
        // Если кнопка добавить в избранное не нажата
        if (svg.style.fill == 'rgb(220, 62, 42)') {

          let cloneGoods = goods[i].cloneNode(true),
            trigger = cloneGoods.querySelector('button'),
            triggerLike = cloneGoods.querySelector('.goods__like'),
            delGoodsButton = document.createElement('div');

          trigger.remove();
          triggerLike.remove();

          delGoodsButton.classList.add('goods__item-remove');
          cloneGoods.appendChild(delGoodsButton);
          delGoodsButton.innerHTML = '&times;';
          likeWrapper.appendChild(cloneGoods);

          if (emptyLike) {
            emptyLike.style.display = 'none';
          }
        } else {
          // Если кнопка уже нажата
          const cloneLikeGoods = likeWrapper.querySelectorAll('.goods__item');

          cloneLikeGoods.forEach(cloneItem => {
            const cloneLikeGoodsTitle = cloneItem.querySelector('.goods__title'),
              cloneLikeGoodsTitleText = cloneLikeGoodsTitle.textContent,
              parent = btn.parentElement,
              parentTitle = parent.querySelector('.goods__title'),
              parentTitleText = parentTitle.textContent;

            if (cloneLikeGoodsTitleText == parentTitleText) {
              cloneItem.remove();
            }
          });

        }

        countGoods(likeWrapper, countLike, emptyLike);

      });
    });

    /**
     * Удаляет товары с избранных
     *
     */
    function removeLikesGoods() {
      const removeLikesButton = likeWrapper.querySelectorAll('.goods__item-remove');

      removeLikesButton.forEach(close => {
        close.addEventListener('click', () => {

          let parent = close.parentElement,
            parentTitle = parent.querySelector('.goods__title'),
            parentTitleText = parentTitle.textContent;

          goodsTitle.forEach(str => {

            if (str.textContent == parentTitleText) {
              let parentStr = str.parentElement,
                parentLikePicButton = parentStr.querySelector('.goods__like > svg');

              parentLikePicButton.style.fill = 'none';
            }

          });

          parent.remove();

          countGoods(likeWrapper, countLike, emptyLike);
        });
      });
    }

    // Оформления заказа
    cartConfirm.addEventListener('click', () => {
      let allItems = cartWrapper.querySelectorAll('.goods__item');

      if (allItems.length > 0) {
        let totalPrice = +total.textContent;

        allItems.forEach(item => {
          item.remove();
          countGoods(cartWrapper, cartBadge, emptyCart);
        });

        calcTotalPrice();
        close(cart);

        alert(`Ваш заказ на сумму ${totalPrice} грн оформлен.\nСпасибо!\n\nНаш оператор скоро свяжется с Вами.`);
      } else {
        alert('Добавьте хотя бы один продукт!');
      }

    });

  });

});
