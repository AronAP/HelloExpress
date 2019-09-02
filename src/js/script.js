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
   * Формирует карточки с товарами и добавляет их на страницу (используются стили Bootstrap 4)
   *
   * @param {*} arr - массив данных, сформированный из базы данных
   */
  function makeElement(arr) {
    const goodsWrapper = document.querySelector('.goods__wrapper');
    let newWrapper = document.createElement('div');

    newWrapper.classList.add('row', 'align-items-start');
    goodsWrapper.appendChild(newWrapper);

    arr.forEach(item => {
      let newBlock = document.createElement('div');
      let newBootstrapBlock = document.createElement('div');

      newBootstrapBlock.classList.add('col-12', 'col-sm-6', 'col-lg-4', 'col-xl-3');

      newBlock.classList.add('goods__item');
      newBlock.innerHTML = `
            <img class="goods__img" src="${item.url}" alt="phone">
            <div class="goods__colors">Доступно цветов: 4</div>
            <div class="goods__title">${item.title}</div>

            <div class="goods__info">

              <div class="goods__price">
                  <span>${item.price}</span> грн/шт
              </div>

              <div class="goods__counter">

                  <button id="minus" disabled="">
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 491.858 491.858" xml:space="preserve">
                    <path d="M465.167,211.613H240.21H26.69c-8.424,0-26.69,
                    11.439-26.69,34.316s18.267,34.316,26.69,34.316h213.52h224.959
                      c8.421,0,26.689-11.439,26.689-34.316S473.59,211.613,465.167,211.613z"/>
                    </svg>
                  </button>

                  <span>1</span>

                  <button id="plus">
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 491.86 491.86" xml:space="preserve">
                      <path d="M465.167,211.614H280.245V26.691c0-8.424-11.439-26.69-34.316-26.69s-34.316,
                      18.267-34.316,26.69v184.924H26.69 C18.267,211.614,0,223.053,0,245.929s18.267,
                      34.316,26.69,34.316h184.924v184.924c0,8.422,11.438,26.69,34.316,26.69 s34.316-18.268,
                      34.316-26.69V280.245H465.17c8.422,0,26.69-11.438,26.69-34.316S473.59,211.614,465.167,211.614z"/>
                    </svg>
                  </button>

              </div>

              <div class="goods__total-price">
                  <div>Сумма</div>
                  <span>0</span> грн
              </div>

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

      newBootstrapBlock.appendChild(newBlock);
      newWrapper.appendChild(newBootstrapBlock);
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
      emptyLike = likeWrapper.querySelector('.empty'),
      searchInput = document.querySelector('.search__input');

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
          trigger = cloneGoods.querySelector('.goods__btn'),
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

        const parent = btn.parentElement,
          childGoodsTitle = parent.querySelector('.goods__title'),
          fullGoodsTitle = childGoodsTitle.dataset.titleFull;

        cartWrapper.appendChild(cloneGoods);

        let cloneGoodsTitle = cloneGoods.querySelector('.goods__title');

        cloneGoodsTitle.textContent = fullGoodsTitle;

        btn.setAttribute('disabled', '');
        btn.textContent = 'Товар в корзине';

        countGoods(cartWrapper, cartBadge);

        if (countGoods(cartWrapper, cartBadge) == 0) {
          emptyCart.style.display = 'block';
          cartConfirm.setAttribute('disabled', '');
        } else {
          emptyCart.style.display = 'none';
          cartConfirm.removeAttribute('disabled');
        }

        selectTheNumberOfGoods();
        calcTotalPriceOfOneGoods();
        calcTotalPrice();
      });
    });

    /**
     * Обрезает заголовки в карточках товаров
     *
     */
    function sliceTitle() {

      goodsTitle.forEach(str => {

        str.setAttribute('data-title-full', str.textContent);

        if (str.textContent.length <= 49) {
          return;
        } else {
          const newStr = `${str.textContent.slice(0, 49)}...`;
          str.textContent = newStr;
          str.setAttribute('data-title-short', newStr);
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
     * @returns {number} количество товаров
     */
    function countGoods(wrapper, countSpan) {
      let numGoods = wrapper.querySelectorAll('.goods__item');

      countSpan.textContent = numGoods.length;

      return numGoods.length;
    }

    /**
     * Подсчитывает общую стоимость товаров
     *
     */
    function calcTotalPrice() {
      const priceGoods = cartWrapper.querySelectorAll('.goods__total-price > span');

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

          const parent = close.parentElement,
            parentTitle = parent.querySelector('.goods__title'),
            shortGoodsTitle = parentTitle.dataset.titleShort;

          goodsTitle.forEach(str => {

            if (str.textContent == shortGoodsTitle) {
              let parentStr = str.parentElement,
                parentButton = parentStr.querySelector('.goods__btn');

              parentButton.removeAttribute('disabled');
              parentButton.textContent = 'Добавить в корзину';
            }

          });

          parent.remove();

          countGoods(cartWrapper, cartBadge);

          if (countGoods(cartWrapper, cartBadge) == 0) {
            emptyCart.style.display = 'block';
            cartConfirm.setAttribute('disabled', '');
          } else {
            emptyCart.style.display = 'none';
            cartConfirm.removeAttribute('disabled');
          }

          calcTotalPrice();
        });
      });
    }

    /**
     * Добавляет или убавляет на 1 количество одного товара в корзине
     *
     */
    function selectTheNumberOfGoods() {
      const counter = cartWrapper.querySelectorAll('.goods__counter');

      counter.forEach(item => {
        const counterPlus = item.querySelector('#plus'),
          counterMinus = item.querySelector('#minus'),
          counterNum = item.querySelector('span');

        let num = 1;

        counterPlus.addEventListener('click', () => {
          counterNum.textContent = ++num;

          counterMinus.removeAttribute('disabled', '');

          if (num == 9) {
            counterPlus.setAttribute('disabled', '');
          }

          calcTotalPriceOfOneGoods();
        });

        counterMinus.addEventListener('click', () => {
          counterNum.textContent = --num;

          counterPlus.removeAttribute('disabled', '');

          if (num <= 1) {
            counterMinus.setAttribute('disabled', '');
          }

          calcTotalPriceOfOneGoods();
        });
      });
    }

    /**
     * Подсчитывает общую стоимость одного товара в корзине
     *
     */
    function calcTotalPriceOfOneGoods() {
      const goodsInCart = cartWrapper.querySelectorAll('.goods__item');

      goodsInCart.forEach(item => {

        let priceOneGoods = item.querySelector('.goods__price > span'),
          counterNum = item.querySelector('.goods__counter > span'),
          priceAllGoods = item.querySelector('.goods__total-price > span');

        priceAllGoods.textContent = priceOneGoods.textContent * counterNum.textContent;

        calcTotalPrice();
      });
    }

    /**
     * Показать/скрыть кнопку "Добавить в избранное" на больших экранах
     *
     */
    function showLikeButtonLarge() {
      goods.forEach(item => {
        const likeBtn = item.querySelector('.goods__like');

        item.addEventListener('mouseover', () => {
          likeBtn.style.visibility = 'visible';
        });

        item.addEventListener('mouseout', () => {
          likeBtn.style.visibility = 'hidden';
        });

      });
    }

    if (document.documentElement.clientWidth >= 768) {
      showLikeButtonLarge();
    }

    /**
     * Показать/скрыть кнопку "Добавить в избранное" на маленьких экранах
     *
     */
    function showLikeButtonSmall() {
      goods.forEach(item => {
        const likeBtn = item.querySelector('.goods__like');

        likeBtn.style.visibility = 'visible';
      });
    }

    if (document.documentElement.clientWidth < 768) {
      showLikeButtonSmall();
    }

    /**
     * Показать/скрыть карточку с полным заголовком на больших экранах
     *
     */
    function showFullTitleLarge() {
      goods.forEach(item => {
        const title = item.querySelector('.goods__title');

        item.addEventListener('mouseover', () => {
          let fullTitle = title.dataset.titleFull;

          title.textContent = fullTitle;
        });

        item.addEventListener('mouseout', () => {
          let shortTitle = title.dataset.titleShort;

          title.textContent = shortTitle;
        });
      });
    }

    if (document.documentElement.clientWidth >= 768) {
      showFullTitleLarge();
    }

    /**
     * Показать/скрыть карточку с полным заголовком на маленьких экранах
     *
     */
    function showFullTitleSmall() {
      goods.forEach(item => {
        const title = item.querySelector('.goods__title');

        title.addEventListener('touchstart', () => {
          let fullTitle = title.dataset.titleFull;
          let shortTitle = title.dataset.titleShort;

          if (title.textContent == fullTitle) {
            title.textContent = shortTitle;
          } else {
            title.textContent = fullTitle;
          }
        });
      });
    }

    if (document.documentElement.clientWidth < 768) {
      showFullTitleSmall();
    }

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
            trigger = cloneGoods.querySelector('.goods__btn'),
            triggerLike = cloneGoods.querySelector('.goods__like'),
            delGoodsButton = document.createElement('div');

          trigger.remove();
          triggerLike.remove();

          delGoodsButton.classList.add('goods__item-remove');
          cloneGoods.appendChild(delGoodsButton);
          delGoodsButton.innerHTML = '&times;';

          const parent = btn.parentElement,
            childGoodsTitle = parent.querySelector('.goods__title'),
            shortGoodsTitle = childGoodsTitle.dataset.titleShort;

          likeWrapper.appendChild(cloneGoods);

          let cloneGoodsTitle = cloneGoods.querySelector('.goods__title');

          cloneGoodsTitle.textContent = shortGoodsTitle;

        } else {
          // Если кнопка уже нажата
          const cloneLikeGoods = likeWrapper.querySelectorAll('.goods__item');

          cloneLikeGoods.forEach(cloneItem => {
            const cloneLikeGoodsTitle = cloneItem.querySelector('.goods__title'),
              cloneLikeGoodsTitleText = cloneLikeGoodsTitle.textContent,
              parent = btn.parentElement,
              childGoodsTitle = parent.querySelector('.goods__title'),
              shortGoodsTitle = childGoodsTitle.dataset.titleShort;

            if (cloneLikeGoodsTitleText == shortGoodsTitle) {
              cloneItem.remove();
            }
          });

        }

        countGoods(likeWrapper, countLike);

        if (countGoods(likeWrapper, countLike) == 0) {
          emptyLike.style.display = 'block';
        } else {
          emptyLike.style.display = 'none';
        }

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
            shortGoodsTitle = parentTitle.dataset.titleShort;

          goodsTitle.forEach(str => {

            if (str.textContent == shortGoodsTitle) {
              let parentStr = str.parentElement,
                parentLikePicButton = parentStr.querySelector('.goods__like > svg');

              parentLikePicButton.style.fill = 'none';
            }

          });

          parent.remove();

          countGoods(likeWrapper, countLike);

          if (countGoods(likeWrapper, countLike) == 0) {
            emptyLike.style.display = 'block';
          } else {
            emptyLike.style.display = 'none';
          }

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
          countGoods(cartWrapper, cartBadge);

          if (countGoods(cartWrapper, cartBadge) == 0) {
            emptyCart.style.display = 'block';
            cartConfirm.setAttribute('disabled', '');
          } else {
            emptyCart.style.display = 'none';
            cartConfirm.removeAttribute('disabled');
          }
        });

        calcTotalPrice();
        close(cart);

        goodsButton.forEach((btn) => {
          btn.removeAttribute('disabled');
          btn.textContent = 'Добавить в корзину';
        });

        alert(`Ваш заказ на сумму ${totalPrice} грн оформлен.\nСпасибо!\n\nНаш оператор скоро свяжется с Вами.`);
      }

    });

    /**
     * Выводит сообщение об отсутствии поиска на сайте
     *
     */
    function attemptToSearch() {

      searchInput.addEventListener('click', function () {
        this.blur();
        alert('Здравствуйте, функция поиска пока не работает!');
      });

    }
    attemptToSearch();

  });

});
