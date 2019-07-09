window.addEventListener('DOMContentLoaded', () => { // при загрузке DOM

  const loadContent = async (url, callback) => { // функция для вызова базы данных и всех остальных функций
    await fetch(url) // promise: пока фетч не загрузиться ПОЛНОСТЬЮ
      .then(response => response.json()) // promise: получаем ответ и преврати json в javascript обьект
      .then(json => makeElement(json.goods)); // используй код в функции

    callback(); // вызови функцию после ПОЛНОЙ загрузки фетч
  }

  function makeElement(arr) { // функция создания карточек товаров
    const goodsWrapper = document.querySelector('.goods__wrapper'); // находим блок для товаров

    arr.forEach(function (item) { // для каждого элемента массива
      let newBlock = document.createElement('div'); // создаём новый блок

      newBlock.classList.add('goods__item'); // навешиваем класс
      newBlock.innerHTML = `
        <img class="goods__img" src="${item.url}" alt="phone">
        <div class="goods__colors">Доступно цветов: 4</div>
        <div class="goods__title">${item.title}</div>
        <div class="goods__price">
            <span>${item.price}</span> грн/шт
        </div>
        <button class="goods__btn">Добавить в корзину</button>
      `; // вставляем HTML и в него данные с массива
      goodsWrapper.appendChild(newBlock); // добавляем в блок с товаром
    });

  }

  loadContent('js/db.json', () => { // вызываем функцию

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

    function openCart() { // функция открытия корзины
      cart.style.display = 'block';
      document.body.style.overflow = 'hidden';
      removeGoods(); // следим за кликами через функцию удаления товаров
    }

    function closeCart() { // функция закрытия корзины
      cart.style.display = 'none';
      document.body.style.overflow = '';
    }

    cartButton.addEventListener('click', openCart); // вешаем события открытия по клику на корзину

    closeCartButton.addEventListener('click', closeCart); // вешаем события закрытия по клику на корзину

    goodsButton.forEach(function (btn, i) { // для каждой кнопки
      btn.addEventListener('click', () => { // вешаем клик на кнопку
        let cloneGoods = goods[i].cloneNode(true), // клонируем ноду
          trigger = cloneGoods.querySelector('button'), // находим кнопку каждого товара
          delGoodsButton = document.createElement('div'), // создаем пустой блок
          empty = cartWrapper.querySelector('.empty'); // находим в корзине блок с надписью

        trigger.remove(); // удаляем кнопку

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
          }
        }); // выполняем анимацию

        delGoodsButton.classList.add('goods__item-remove'); // вешаем класс на созданный блок
        cloneGoods.appendChild(delGoodsButton); // добавляем созданный блок в склонированную ноду
        delGoodsButton.innerHTML = '&times;'; // добавлем крестик в созданный блок

        cartWrapper.appendChild(cloneGoods); // добавляем эллемент в корзину
        if (empty) { // если есть надпись, то удаляем
          empty.remove();
        }

        calcGoods(); // выполняем подсчёт товаров в корзине
        calcTotal(); // выполняем подсчёт суммы
      });
    });

    function sliceTitle() { // функция для обрезки оглавлений у товаров

      goodsTitle.forEach(function (str) { // для оглавления товара

        if (str.textContent.length <= 49) { //если меньше n слов, то
          return; // ничего не делаем
        } else { // если больше
          const newStr = `${str.textContent.slice(0, 49)}...`; // обрезаем и добавляем "..."
          str.textContent = newStr; // перезаписываем
        }

      });

    }
    sliceTitle(); // вызываем функцию

    function confirmAnimate(options) { // функция для создания анимации
      confirm.style.display = 'block'; // делаем блок видимым

      let start = performance.now();

      requestAnimationFrame(function animate(time) {
        // timeFraction от 0 до 1
        let timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        // текущее состояние анимации
        let progress = options.timing(timeFraction)

        options.draw(progress);

        if (timeFraction < 1) {
          requestAnimationFrame(animate);
        }

      });
    }

    function calcGoods() { // функция для подсчёта товаров в корзине
      let numGoods = cartWrapper.querySelectorAll('.goods__item'); // находим товары в корзине

      cartBadge.textContent = numGoods.length; // находим к-ство товаров в корзине и подставляем в бэйдж

      if (numGoods.length == 0) { // если товаров нету
        let newEmpty = document.createElement('div'); // создаём новый блок

        newEmpty.classList.add('empty'); // вешаем класс
        newEmpty.innerHTML = 'Ваша корзина опять пуста'; // добавляем текст в блок
        cartWrapper.appendChild(newEmpty); // добавляем в блок с корзиной
      }
    }

    function calcTotal() { // функция подсчёта суммы в корзине
      const priceGoods = document.querySelectorAll('.cart__wrapper > .goods__item > .goods__price > span'); // ищем всё цены на товары в корзине
      let totalPrice = 0;

      priceGoods.forEach(function (price) { // каждую цену товара в корзине
        totalPrice += +price.textContent; // суммируем вместе
      });
      total.textContent = totalPrice; // перезаписываем
    }

    function removeGoods() { // функция удаления товара из корзины
      const removeGoodsButton = cartWrapper.querySelectorAll('.goods__item-remove'); // находим все крестики товаров в корзине

      removeGoodsButton.forEach(function (close) { // для каждого крестика
        close.addEventListener('click', () => { // при клике по нём
          close.parentElement.remove(); // удали родителя(товар)

          calcGoods(); // пересчитай к-ство товаро
          calcTotal(); // пересчитай общую сумму товаров
        });
      });
    }
  });

});











// train.onclick = function() {
//   animate(function(timePassed) {
//     train.style.left = timePassed / 5 + 'px';
//   }, 2000);
// };

// // Рисует функция draw
// // Продолжительность анимации duration
// function animate(draw, duration) {
//   var start = performance.now();

//   requestAnimationFrame(function animate(time) {
//     // определить, сколько прошло времени с начала анимации
//     var timePassed = time - start;

//     console.log(time, start)
//       // возможно небольшое превышение времени, в этом случае зафиксировать конец
//     if (timePassed > duration) timePassed = duration;

//     // нарисовать состояние анимации в момент timePassed
//     draw(timePassed);

//     // если время анимации не закончилось - запланировать ещё кадр
//     if (timePassed < duration) {
//       requestAnimationFrame(animate);
//     }

//   });
// }












// function animate(options) {

//   var start = performance.now();

//   requestAnimationFrame(function animate(time) {
//     // timeFraction от 0 до 1
//     var timeFraction = (time - start) / options.duration;
//     if (timeFraction > 1) timeFraction = 1;

//     // текущее состояние анимации
//     var progress = options.timing(timeFraction)

//     options.draw(progress);

//     if (timeFraction < 1) {
//       requestAnimationFrame(animate);
//     }

//   });
// }





// elem.onclick = function() {
//   animate({
//     duration: 1000,
//     timing: function(timeFraction) {
//       return timeFraction;
//     },
//     draw: function(progress) {
//       elem.style.width = progress * 100 + '%';
//     }
//   });
// };
