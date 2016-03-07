var CARD_SQUARE = 1500;
var cardDeckEl = document.getElementById('source');
var dropout = document.getElementById('dropout');

function CardDeck(diff) {
    var SUIT = ['s','h','c','d']; // [spades, hearts, clubs, diamonds]
    var PATTERN = [];
    for (var i = 0; i <= 12; i++) {
        PATTERN[i] = i + 101;
    }

    this.SELECTORS = [];
    for (i = 0; i < diff; i++) {
        this.SELECTORS[i] = '';

        for (var j = 12; ; ) {
            this.SELECTORS[i] += '.' + SUIT[i] + PATTERN[j];
            if (--j < 0) break;
            this.SELECTORS[i] += ' + ';
        }
    }

    var newDeck = [];
    for (i = 0; i < diff; i++) {
        PATTERN.forEach( function(item, num, arr) {
            newDeck.push( SUIT[i] + item );
        });
    }

    while (104 / newDeck.length > 1) {
        newDeck = newDeck.concat(newDeck);
    }

    this.cards = newDeck;
}

function crossingArea(el1, el2) {
    if (!el1 || !el2) return 0;

    var coords_el1 = el1.getBoundingClientRect();
    var coords_el2 = el2.getBoundingClientRect();
    var a, b, c, d;

    coords_el1.top > coords_el2.top ? 
        a = coords_el1.top : a = coords_el2.top;

    coords_el1.bottom > coords_el2.bottom ? 
        b = coords_el2.bottom : b = coords_el1.bottom;

    coords_el1.left > coords_el2.left ? 
        c = coords_el1.left : c = coords_el2.left;

    coords_el1.right > coords_el2.right ? 
        d = coords_el1.right : d = coords_el2.right;

    if ((b - a <= 0) || (d - c <= 0)) return 0;
    return (b - a)*(d - c);
}

function getValueFromRadioButton(buttons) {
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];

        if(button.checked) {
            return button.value;
        }
    }
    return null;
}

function showMessage(text, left, top) {
    if (document.getElementById('message1')) return;
    var el = document.createElement('div');
    el.innerHTML = text;
    el.setAttribute('id', 'message1');
    el.className = 'message';
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    document.body.appendChild(el);
    setTimeout(function() { document.body.removeChild(el) }, 2500);
}

var dealer = {};

dealer.shuffle = function(arr) {
    var i = arr.length;
    var j, t;

    while (i) {
        j = Math.floor((i--) * Math.random());
        t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
    }
};

dealer.reupload = function(cardsArr) {
    var ul = document.createElement('ul');

    for (var i = 0; i < cardsArr.length; i++) {
        var li = document.createElement('li');
        li.className = 'card closed';
        li.classList.add(cardsArr[i]);
        li.dataset.card = cardsArr[i];
        ul.appendChild(li);
    }

    cardDeckEl.innerHTML = ul.innerHTML;
    ul = null;
};

dealer.delivery = function(n, opened, animation) {
    var cols = document.querySelectorAll('.column');
    var c = 0;

    for (var i = 0; i < n; i++) {
        if (!cardDeckEl.lastElementChild) return;

        if (opened) {
            cardDeckEl.lastElementChild.classList.add('open');
            cardDeckEl.lastElementChild.classList.remove('closed');
        }

        animation ? 
            cols[c].animationAppendChild( cardDeckEl.lastElementChild ) :
            cols[c].appendChild( cardDeckEl.lastElementChild );
        if (++c >= cols.length) c = 0;
    }
};

dealer.checkStartDrag = function(target, selectors) {
    var parent = target.parentNode;
    if ( !target.classList.contains('card') ) return;
    if ( !target.classList.contains('open') ) return;
    if ( parent.lastElementChild == target ) return true;

    var sibling = target.nextElementSibling;
    var str = '';

    while (sibling) {
        str += ' + .' + sibling.dataset.card;
        sibling = sibling.nextElementSibling;
    }

    str = '.' + target.dataset.card + str;

    if ( ~selectors.join('').indexOf(str) ) return true;
};

dealer.getDroppable = function(target, source) {
    if (!target) return;
    var pointX = target.getBoundingClientRect().left + target.offsetWidth/2;
    var pointY = target.getBoundingClientRect().top - 3;

    var container = document.elementFromPoint(pointX, pointY);

    while (container) {
        if (container.classList.contains('column')) break;
        container = container.parentElement;
    }

    if (!container || container == source) return;

    if ( !container.children[0] ) return container;

    var s = crossingArea(target, container.lastElementChild);
    if (s < CARD_SQUARE) return;

    var cardNum1 = +target.dataset.card.slice(1);
    var cardNum2 = +container.lastElementChild.dataset.card.slice(1);
    if ( cardNum1 + 1 == cardNum2 ) return container;
};

dealer.takeAway = function(selectors, dropoutEl, animation) {
    var coinc = [];

    for (var i = 0; i < selectors.length; i++) {
        var elems = document.querySelectorAll('.open' + cardDeck.SELECTORS[i]);
        elems = Array.prototype.slice.call(elems);
        coinc = coinc.concat(elems);
    }

    while (coinc[0]) {
        var p = coinc.pop().parentNode;

        for (var i = 12; i >= 0; i--) {
            animation ? 
                dropoutEl.animationAppendChild(p.lastElementChild) :
                dropoutEl.appendChild(p.lastElementChild);
            if (p.children[0]) {
                p.lastElementChild.classList.add('open');
                p.lastElementChild.classList.remove('closed');
            }   
        }
    }
    
};

dealer.checkEmpty = function (elems) {
    for (var i = 0; i < elems.length; i++) {
        if (!elems[i].children[0]) return true;
    }
};

dealer.hint = function(allCards, allPlaces, selectors) {
    dealer.hintCount = dealer.hintCount || 0;
    var find = search(dealer.hintCount) || search(0);
    if (!find) return;

    find[0].classList.add('backlight');

    setTimeout(function() {
        find[1].classList.add('backlight');
    }, 150);

    setTimeout(function() {
        find[0].classList.remove('backlight');
        find[1].classList.remove('backlight');
    }, 1500);

    function search(position) {
        for (var i = position; i < allCards.length; i++) {
            dealer.hintCount = i + 1;

            if (!dealer.checkStartDrag(allCards[i], selectors)) continue;
            var card1 = +allCards[i].dataset.card.slice(1);

            for (var j = 0; j < allPlaces.length; j++) {
                if (allCards[i].parentNode == allPlaces[j].parentNode) continue;
                var card2 = +allPlaces[j].dataset.card.slice(1);

                if (card1 + 1 == card2) return [allCards[i], allPlaces[j]];
            }
        }
    }
};

dealer.showCongratulation = function() {
    setTimeout(function() {
        document.body.classList.add('win');
    }, 1300);
};

dealer.hideCongratulation = function() {
    document.body.classList.remove('win');
};

function getLimitHeight() {
    var lowerEl = document.querySelector('.offside');
    var innerEl = lowerEl.querySelector('.card');
    var innerHeight = 0;
    if (innerEl) innerHeight = getComputedStyle(innerEl).height.slice(0, -2);
    return lowerEl.getBoundingClientRect().bottom - innerHeight;
}

function setSuitedHeight(el, maxHeight) {
    el.dataset.height = '';
    { el.classList.add('ie-fix'); el.classList.remove('ie-fix'); } // ie hack
    var c = 1;
    while (el.getBoundingClientRect().bottom > maxHeight) {
        el.dataset.height = c;
        { el.classList.add('ie-fix'); el.classList.remove('ie-fix'); } // ie hack
        if (++c > 5) break;
    }
}

Node.prototype.animationAppendChild = function(child) {
    if (!TransitionEvent) return;

    var startCoords = {
        top: child.getBoundingClientRect().top,
        left: child.getBoundingClientRect().left
    }

    this.appendChild(child);

    var endCoords = {
        top: child.getBoundingClientRect().top,
        left: child.getBoundingClientRect().left
    }

    child.style.display = 'none';

    var ghost = document.createElement('div');
    ghost.className = child.className;
    ghost.classList.add('ghost');
    ghost.style.top = startCoords.top + 'px';
    ghost.style.left = startCoords.left + 'px';
    document.body.insertBefore(ghost, document.body.children[0]);

    var queue = document.querySelectorAll('.ghost').length - 1;
    ghost.style.transitionDelay = queue*80 + 'ms';

    ghost.onmousedown = function(e) {
        e.stopPropagation();
    }

    ghost.addEventListener('transitionend', function(e) {
        if (!e.target.parentNode) return;
        child.style.display = '';
        ghost.parentNode.removeChild(ghost);
        ghost = null;
    });

    setTimeout(function() {
        ghost.style.top = endCoords.top + 'px';
        ghost.style.left = endCoords.left + 'px';
    }, 0);

    return child;
};

var dragObj = {};
dragObj.el = document.getElementById('drag-el');

// variable after start game
var limitHeight;

// Events ---------------------------------------
window.onresize = function() {
    limitHeight = getLimitHeight();
    var cols = document.querySelectorAll('.column');
    for (var i = 0; i < cols.length; i++) {
        setSuitedHeight(cols[i], limitHeight);
    }
}

var cardDeck;  // = new CardDeck();
document.forms.startGame.onsubmit = function() {
    var d = getValueFromRadioButton(this.diff);
    cardDeck = new CardDeck(d);
    dealer.shuffle(cardDeck.cards);
    this.style.display = 'none';
    dealer.reupload(cardDeck.cards);
    dealer.delivery(44);
    dealer.delivery(10, true);
    document.querySelector('.opaque').classList.remove('opaque');
    limitHeight = getLimitHeight();
    return false;
}

document.forms.startGame.onmousedown = function(e) {
    e.stopPropagation();
}

cardDeckEl.onclick = function(e) {
    if ( this.lastElementChild != e.target ) return;

    var empt = dealer.checkEmpty(document.querySelectorAll('.column'));
    if (empt) {
        var text = 'Сдавать на пустые клетки нельзя!';
        showMessage(text, e.pageX - 320, e.pageY - 80);
        return;
    }

    dealer.delivery(10, true, true);
    dealer.takeAway(cardDeck.SELECTORS, dropout, true);

    var cols = document.querySelectorAll('.column');
    limitHeight = getLimitHeight();
    for (var i = 0; i < cols.length; i++) {
        setSuitedHeight(cols[i], limitHeight);
    }
}

document.onmousedown = function(e) {
    var t = e.target;
    if (e.which != 1 ||
        !cardDeck ||
        dragObj.el.children[0] ||
        !dealer.checkStartDrag(t, cardDeck.SELECTORS) ) return;

    dragObj.shiftX = e.pageX - t.getBoundingClientRect().left;
    dragObj.shiftY = e.pageY - t.getBoundingClientRect().top;
    dragObj.el.style.left = e.pageX - dragObj.shiftX + 'px';
    dragObj.el.style.top = e.pageY - dragObj.shiftY + 'px';

    while (t != t.parentNode.lastElementChild) {
        dragObj.el.insertBefore(t.parentNode.lastElementChild, dragObj.el.children[0]);
    }

    dragObj.parentOld = t.parentNode;
    dragObj.el.insertBefore(t, dragObj.el.children[0]);
}

document.onmousemove = function(e) {
    if ( !dragObj.el.children[0] ) return;

    dragObj.el.style.left = e.pageX - dragObj.shiftX + 'px';
    dragObj.el.style.top = e.pageY - dragObj.shiftY + 'px';
    return false;
}

document.onmouseup = function() {
    if ( !dragObj.el.children[0] ) return;

    dragObj.parentNew = dealer.getDroppable(dragObj.el.children[0], dragObj.parentOld);

    while (dragObj.el.children[0]) {
        dragObj.parentNew ?
            dragObj.parentNew.appendChild(dragObj.el.children[0]) :
            dragObj.parentOld.appendChild(dragObj.el.children[0]);
    }

    if (dragObj.parentNew && dragObj.parentOld.children[0]) {
        dragObj.parentOld.lastElementChild.classList.add('open');
        dragObj.parentOld.lastElementChild.classList.remove('closed');
    }

    if (dragObj.parentNew) {
        dealer.takeAway(cardDeck.SELECTORS, dropout, true);
        setSuitedHeight(dragObj.parentNew, limitHeight);
        setSuitedHeight(dragObj.parentOld, limitHeight);
    }

    if (dropout.children.length == 104) dealer.showCongratulation();
}

document.querySelector('.btn-hint').onclick = function(e) {
    var allCards = document.querySelectorAll('.column .card.open');
    var allPlaces = document.querySelectorAll('.column .card.open:last-child');

    if (allCards.length == 0) {
        return;
        
    } else if (allPlaces.length < 10) {
        var text = 'Можете походить на пустые клетки :)';
        showMessage(text, e.pageX-80, e.pageY-80);
        return;
    }

    dealer.hint(allCards, allPlaces, cardDeck.SELECTORS);
}

document.querySelector('.btn-new').onclick = function(e) {
    if (!cardDeck) return;
    if (dropout.children.length == 104) dealer.hideCongratulation();

    dropout.innerHTML = '';
    var cols = document.querySelectorAll('.column');
    for (var i = 0; i < cols.length; i++) {
        cols[i].innerHTML = '';
    }

    dealer.shuffle(cardDeck.cards);
    dealer.reupload(cardDeck.cards);
    dealer.delivery(44);
    dealer.delivery(10, true);
}

document.querySelector('.btn-rev').onclick = function(e) {
    if (!cardDeck) return;
    var text = 'Назад уже ничего не вернуть...';
    showMessage(text, e.pageX-100, e.pageY-100);
}

document.querySelector('.btn-faq').onclick = function() {
    document.getElementById('faq').classList.add('open');
}

document.querySelector('.faq-close').onclick = function() {
    document.getElementById('faq').classList.remove('open');
}