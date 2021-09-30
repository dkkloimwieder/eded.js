import { Ed } from './Ed.js';
function updateScroll(element) {
  element.scrollTop = element.scrollHeight;
}
function keyChange(e) {
  if (e.key === 'Enter') {
    const inputValue = input.value;
    output.innerHTML += inputValue + '<br>';
    const { explanation, lines } = edEd.readLine(inputValue);
    if (lines && lines[0] !== null) {
      for (const line of lines) {
        output.innerHTML += '' + line + '<br>';
      }
    }
    if (explanation) {
      errors.innerHTML = `${explanation}<br>`;
    } else {
      errors.innerHTML = '';
    }

    updateScroll(output);
    input.value = '';
  }
}

const edEd = new Ed();
let input = document.getElementById('ed-input');
let output = document.getElementById('ed-output');
let errors = document.getElementById('errors');
input.addEventListener('keyup', (e) => keyChange(e));
