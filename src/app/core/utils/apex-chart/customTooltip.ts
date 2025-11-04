import { PollCountAnswer } from '@core/models/summary.model';

export function customTooltip(
  xValue: string,
  yValue: string,
  formattedZValue: string
): string {
  return `
    <div class="apexcharts-tooltip-x" style="font-size: 18px; margin-bottom: 10px;">
      <b>Q: ${xValue}</b>
    </div>
    <div class="apexcharts-tooltip-y" style="font-size: 16px; color: #797676; margin-bottom: 10px;">
      <b>Answer: </b>${yValue}
    </div>
    <div style="border-top: 1px solid #ccc; margin-bottom: 10px;"></div>
    <div class="apexcharts-tooltip-z" style="font-size: 14px; margin: 4px">
      ${_formatEmailsList(formattedZValue)}
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
      return `<ul style="padding: 0 0 0 15px; color: #797676;">${listItems}</ul>`;
    }
  );

  return htmlText;
}
