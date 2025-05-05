export default class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
  }

  onStart(event) {
    event.preventDefault();
    this.wrapper.addEventListener('mousemove', this.onMove);
  }

  onMove(event) {
  }

  onEnd(event) {
    this.wrapper.removeEventListener('mousemove', this.onMove);
  }

  addSlideEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this); // usamos o bind para alterar o ".this" quando clicado nas imagens. antes trazia o .slide-wrapper, Com o bind traz o .slide (referencia ao objeto)
    this.onMove = this.onMove.bind(this); 
    this.onEnd = this.onEnd.bind(this); 
  }

  init() {
    this.bindEvents();
    this.addSlideEvents();
    return this;
  }
}
