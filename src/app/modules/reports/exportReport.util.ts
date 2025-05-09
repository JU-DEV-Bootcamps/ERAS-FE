import { ElementRef } from '@angular/core';

export function printReportInfo(mainContainer: ElementRef): HTMLElement {
  const mainContainerElement = mainContainer.nativeElement;
  const clonedElement = mainContainerElement.cloneNode(true) as HTMLElement;
  clonedElement.style.width = '1440px';
  clonedElement.style.margin = 'auto';

  const swiperContainer = clonedElement.querySelector('#swiper-container');
  if (swiperContainer) {
    swiperContainer.removeAttribute('effect');
  }

  clonedElement.style.fontSize = '1.2em';

  const h2Elements = clonedElement.querySelectorAll('h2');
  h2Elements.forEach(h2 => (h2.style.fontSize = '1.6em'));

  const h3Elements = clonedElement.querySelectorAll('h3');
  h3Elements.forEach(h3 => (h3.style.fontSize = '1.4em'));

  const h4Elements = clonedElement.querySelectorAll('h4');
  h4Elements.forEach(h4 => (h4.style.fontSize = '1.2em'));

  const pElements = clonedElement.querySelectorAll('p');
  pElements.forEach(p => (p.style.fontSize = '1.2em'));

  clonedElement.querySelector('#print-button')?.remove();
  clonedElement.querySelector('.form-container')?.remove();
  clonedElement.querySelector('.filter-container')?.remove();
  clonedElement.querySelector('.title-card')?.remove();

  const containerCardList = clonedElement.querySelector(
    '.container-card-list'
  ) as HTMLElement;
  if (containerCardList) {
    Object.assign(containerCardList.style, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    });
  }

  const chartContainer = clonedElement.querySelector(
    '.chart-container'
  ) as HTMLElement;
  if (chartContainer) {
    Object.assign(chartContainer.style, {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      margin: '0 auto',
      maxWidth: 'none',
    });
  }
  return clonedElement;
}
