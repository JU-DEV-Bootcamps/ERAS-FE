import { RISK_COLORS } from '@core/constants/riskLevel';
import { PollCountAnswer } from '@core/models/summary.model';

export function customTooltip(
  yValue: string,
  formattedZValue: string,
  color: string
): string {
  return `
  <div>
    <div class="apexcharts-tooltip-y item-tooltip" >
      ${_formatStudentItem(color)}
      <span>${yValue} Students</span>
    </div>
    <div class="apexcharts-tooltip-z">
      ${_formatEmailsList(formattedZValue)}
    </div>
  </div>
  `;
}

export function addCountPercentages(
  answers: PollCountAnswer[]
): PollCountAnswer[] {
  const total = answers.reduce((sum, item) => sum + item.count, 0);

  return answers.map(item => ({
    ...item,
    countPercentage:
      total > 0 ? parseFloat(((item.count / total) * 100).toFixed(2)) : 0,
  }));
}

function _formatEmailsList(textToFormat: string): string {
  if (!textToFormat) return '';

  // Remove any ; alone, after an email and before of <br/> or <span>
  let htmlText = textToFormat
    .replace(/;(\s*<br\/>)/g, '$1')
    .replace(/;(\s*<)/g, '$1');

  // Replace emails by <ul><li>
  htmlText = htmlText.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:[;,]\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*)/g,
    match => {
      const emails = match
        .split(/[;,]\s*/)
        .map(e => e.trim())
        .filter(Boolean);

      const listItems = emails.map(email => `<li>${email}</li>`).join('');
      return `<ul class="mail-list">${listItems}</ul>`;
    }
  );

  return htmlText;
}

function _formatStudentItem(color: string): string {
  const indexColor = Object.entries(RISK_COLORS).find(
    ([value]) => value === color
  )?.[0];
  return `<div class="point-tooltip-color-${indexColor}"></div>`;
}
