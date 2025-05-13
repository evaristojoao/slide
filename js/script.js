import { SlideNav } from './slide.js';
// 1º - Cria uma nova instância do objeto Slide, passando os seletores do slide e do wrapper
const slide = new SlideNav('.slide', '.slide-wrapper');

slide.init();
slide.addArrow('.prev', '.next');
slide.addControl();


// slide.changeSlide(3);
// slide.activePrevSlide();