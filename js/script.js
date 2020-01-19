"use strict";

document.addEventListener('DOMContentLoaded', () => {
    
    const search = document.querySelector('.search'); 
    const cartBt = document.getElementById('cart');
    const wishListBtn = document.getElementById('wishlist');
    const goodsWrapper = document.querySelector('.goods-wrapper');
    const cart =document.querySelector('.cart');
    const category = document.querySelector('.category');
    const cardCouter = cartBt.querySelector('.counter');
    const wishlistCouter = wishListBtn.querySelector('.counter');
    const cartWrapper = document.querySelector('.cart-wrapper');


    const wishlist = [];

    let goodsBasket = {};
    
    const loading = (nameFanction) => {
        const spinner = `<div id="spinner"><div class="spinner-loading"><div><div><div></div>
        </div><div><div></div></div><div>
        <div></div></div><div><div></div>
        </div></div></div></div>`;

        if(nameFanction === 'renderCard'){
            goodsWrapper.innerHTML = spinner;
        }

        if (nameFanction === 'renderBasket') {
            cartWrapper.innerHTML = spinner;
        }
    };

    //request to server

    const getGoods = (handler, filter) => {
        loading(handler.name);
        fetch('db/db.json')
            .then(response => response.json())
            .then(filter)
            .then(handler);
    };

    //render card

    const createCardGoods = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `<div class="card">
                                <div class="card-img-wrapper">
                                    <img class="card-img-top" src="${img}" alt="">
                                    <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" 
                                        data-goods-id="${id}"></button>
                                </div>
                                <div class="card-body justify-content-between">
                                    <a href="#" class="card-title">${title}</a>
                                    <div class="card-price">${price} ₽</div>
                                    <div>
                                        <button class="card-add-cart" data-goods-id="${id}">Добавить в корзину</button>
                                    </div>
                                </div>
                            </div>`;
        return card;
    };

    //render basket

    const createCardGoodsBasket = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'goods';
        card.innerHTML = `<div class="goods-img-wrapper">
                                <img class="goods-img" src="${img}" alt="">
                            </div>
                            <div class="goods-description">
                                <h2 class="goods-title">${title}</h2>
                                <p class="goods-price">${price} ₽</p>
                            </div>
                            <div class="goods-price-count">
                                <div class="goods-trigger">
                                    <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" data-goods-id="${id}"></button>
                                    <button class="goods-delete" data-goods-id="${id}"></button>
                                </div>
                                <div class="goods-count">${goodsBasket[id]}</div>
                            </div>`;
        return card;
    };

    
        const renderCard = (goods) => {
            goodsWrapper.textContent = '';

            if (goods.length) {
                goods.forEach(({
                    id,
                    title,
                    price,
                    imgMin
                }) => {
                    goodsWrapper.append(createCardGoods(id, title, price, imgMin));
                });
            } else {
                goodsWrapper.textContent = '❌ Извините, мы не нашли товаров по вашему запросу';
            }

        };

         const renderBasket = (goods) => {
             cartWrapper.textContent = '';

             if (goods.length) {
                 goods.forEach(({
                     id,
                     title,
                     price,
                     imgMin
                 }) => {
                     cartWrapper.append(createCardGoodsBasket(id, title, price, imgMin));
                 });
             } else {
                 cartWrapper.innerHTML = '<div id="cart-empty">Ваша корзина пока пуста</div>';
             }

         };

    const calcTotalPrice = goods => {

        let sum = goods.reduce((accum, item) => {
            return accum + item.price * goodsBasket[item.id];
        }, 0)

        cart.querySelector('.cart-total>span').textContent = sum.toFixed(2);
    }

    const checkCount = () => {
        wishlistCouter.textContent = wishlist.length;
        cardCouter.textContent = Object.keys(goodsBasket).length;
    };

    //filters

    const showCardBasket = (goods) => {
        const basketGoods = goods.filter(item => goodsBasket.hasOwnProperty(item.id));
        calcTotalPrice(basketGoods);
        return basketGoods;
    };

    const randomSort = (item) => item.sort(() => Math.random() - 0.5);

    const showWishlist = () => {
        getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)))
    };

    //localStorage & Cookie

    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    const cookieQuery = get => {
        if (get) {
            if (getCookie('goodsBasket')) {
                Object.assign(goodsBasket, JSON.parse(getCookie('goodsBasket')));
            }
            checkCount();
        } else {
            document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)}; max-age = 86400e3`;
        }

    };

    const storageQuery = (get) => {

        if (get) {

            if (localStorage.getItem('wishlist')) {
                wishlist.push(...JSON.parse(localStorage.getItem('wishlist')));
            }
            checkCount();

        } else {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }

    };

    const closeCat = (event) => {
        const target = event.target;
         if(target === cart || target.classList.contains('cart-close') || event.keyCode === 27){
             cart.style.display ='';
             document.removeEventListener('keyup', closeCat);
         }
     };

    const openCart = (event) => {
        event.preventDefault();
        cart.style.display = 'flex';
        document.addEventListener('keyup', closeCat);
        getGoods(renderBasket, showCardBasket);
    };

    
    const choiceCategory = (event) => {
        event.preventDefault();
        const target = event.target;

        if(target.classList.contains('category-item')) {
            const category = target.dataset.category;
            getGoods(renderCard,
                (goods) => goods.filter(item => item.category.includes(category)));
            }
        };

    const searchGoods = (event) => {
        event.preventDefault();
        const input = event.target.elements.searchGoods;
        const inputValue = input.value.trim();
        if (inputValue !== '') {
            const searchString = new RegExp(inputValue, 'i')
            getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)));
             
        } else {
            search.classList.add('error');
            setTimeout(() => {
                search.classList.remove('error');
            }, 2000);
        }

        input.value ='';
    };

    const tooggleWishlist = (id, elem) => {

        if(wishlist.includes(id)) {
            wishlist.splice(wishlist.indexOf(id), 1);
            elem.classList.remove('active')
        } else{
            wishlist.push(id);
            elem.classList.add('active')
        }
        checkCount();
        storageQuery();
    };

    const addBasket =(id) => {

        if (goodsBasket[id]) {
            goodsBasket[id] += 1
        } else {
            goodsBasket[id] = 1
        }

       checkCount();
       cookieQuery();
    };


    const removeGoods = id => {
        delete goodsBasket[id];
        checkCount();
        cookieQuery();
        getGoods(renderBasket, showCardBasket, 'cart');
    };


    const handlerGoods = (event) => {
        const target = event.target;

        if(target.classList.contains('card-add-wishlist')) {
             tooggleWishlist(target.dataset.goodsId, target);
        };

        if(target.classList.contains('card-add-cart')) {
            addBasket(target.dataset.goodsId);
        };
    }


    const handlerBasket = () => {
        const target = event.target;
        if (target.classList.contains('goods-add-wishlist')) {
            toggleWishList(target.dataset.goodsId, target);
        }

        if (target.classList.contains('goods-delete')) {
            removeGoods(target.dataset.goodsId);
        }
    }

    
    cartBt.addEventListener('click', openCart);
    cart.addEventListener('click', closeCat);
    category.addEventListener('click', choiceCategory);
    search.addEventListener('submit', searchGoods);
    goodsWrapper.addEventListener('click', handlerGoods);
    cartWrapper.addEventListener('click', handlerBasket);
    wishListBtn.addEventListener('click',showWishlist);

    getGoods(renderCard, randomSort);
    storageQuery(true);
    cookieQuery(true);
});