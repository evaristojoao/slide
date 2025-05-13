import debounce from './debounce.js';
export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.dist = { finalPosition: 0,  startX: 0, movement: 0 }; // Armazena os dados da movimentação
    this.activeClass = 'active';
    this.changeEvent = new Event('changeEvent');
  }

  transition(active) {
    this.slide.style.transition = active ? 'transform .3s' : '';
  }

  moveSlide(distX) { // Move o slide horizontalmente (translate3d) para a posição distX.
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`; 
  }
 
  updatePosition(clientX) { // Calcula quanto o slide deve se mover, Multiplica por 1.6 para dar um efeito de aceleração, Retorna a nova posição do slide baseada no movimento do mouse.
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  onStart(event) { // Inicia o movimento, Salva a posição inicial do mouse (startX), Começa a escutar o movimento do mouse.
    let movetype;
    if (event.type === 'mousedown') {
        event.preventDefault();
        this.dist.startX = event.clientX;
        movetype = 'mousemove';
    } else {
        this.dist.startX = event.changedTouches[0].clientX;
        movetype = 'touchmove';
    }
    this.wrapper.addEventListener(movetype, this.onMove);
    this.transition(false);
  }

  onMove(event) { // Enquanto o mouse se move, calcula a nova posição e move o slide.
    const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  onEnd(event) { // Pára o movimento, Define finalPosition como a última posição do slide.
    const movetype = (event.type === 'mouseup') ? 'mousemove' : 'touchmove';
    this.wrapper.removeEventListener(movetype, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.changeSlideOnEnd();
    this.transition(true);
  }

  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.next !== undefined) {
        this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
        this.activePrevSlide();
    } else {
        this.changeSlide(this.index.active);
    }
  }

  addSlideEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('touchstart', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchend', this.onEnd);
  }

  slidePosition(slide) {
     const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
     return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
        const position = this.slidePosition(element);
        return {
            position,
            element
        }
    });
  }

  slideIndexNav(index) {
    const last = this.slideArray.length -1;
    this.index = {
        prev: index ? index -1 : undefined,
        active: index,
        next: index === last ? undefined : index +1,
    }
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(this.slideArray[index].position);
    this.slideIndexNav(index);
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  changeActiveClass() {
    this.slideArray.forEach(item => item.element.classList.remove(this.activeClass));
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  activePrevSlide() {
    if(this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }

  activeNextSlide() {
    if(this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  onResize() {
    setTimeout(() => {
        this.slidesConfig();
        this.changeSlide(this.index.active);
    }, 1000);
  }

  addResizeEvent() {
    window.addEventListener('resize', this.onResize);
  }

  bindEvents() { // 
    this.onStart = this.onStart.bind(this); // usamos o bind para alterar o ".this" quando clicado nas imagens. antes trazia o .slide-wrapper, Com o bind traz o .slide (referencia ao objeto)
    this.onMove = this.onMove.bind(this); 
    this.onEnd = this.onEnd.bind(this); 
    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
  }

  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent();
    this.changeSlide(0);
    return this;
  }
}

export class SlideNav extends Slide { // se o constructor for o mesmo não é preciso reescrever
    constructor(slide, wrapper) {
        super(slide, wrapper); 
        this.bindControlEvents();
    }

    addArrow(prev, next) {
        this.prevElement = document.querySelector(prev);
        this.nextElement = document.querySelector(next);
        this.addArrowEvent();
    }

    addArrowEvent() {
        this.prevElement.addEventListener('click', this.activePrevSlide);
        this.nextElement.addEventListener('click', this.activeNextSlide);
    }

    createControl() {
        const control = document.createElement('ul');
        control.dataset.control = 'slide'; // serve para ter controlo sobre o control
        this.slideArray.forEach((item, index) => {
            control.innerHTML += `<li><a href="#slide${index +1}">${index +1}</a></li>`;
        });
        this.wrapper.appendChild(control);
        return control;
    }

    eventControl(item, index) {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        this.changeSlide(index);
      });  
      this.wrapper.addEventListener('changeEvent', this.activeControlItem);
    }
 
    activeControlItem() {
        this.controlArray.forEach(item => item.classList.remove(this.activeClass));
        this.controlArray[this.index.active].classList.add(this.activeClass);
        this.wrapper.addEventListener('changeEvent', this.activeControlItem);
    }

    addControl(customControl) {
        this.control = document.querySelector(customControl) || this.createControl();
        this.controlArray = [...this.control.children];

        this.activeControlItem();
        this.controlArray.forEach(this.eventControl);
    }

    bindControlEvents() {
        this.eventControl = this.eventControl.bind(this);
        this.activeControlItem = this.activeControlItem.bind(this);
    }
}