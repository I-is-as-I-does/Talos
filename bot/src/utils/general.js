function isString(value){
  return typeof value === 'string' || value instanceof String;
}

function fixBoolean(value) {
  if (isString(value)) {
    var lwrc = value.toLowerCase();
    if (lwrc === 'true') {
      value = true;
    } else if (lwrc === 'false') {
      value = false;
    }

  }
  return value;
}

function randomItem(items){
  return items[Math.floor(Math.random()*items.length)];
}
function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { 
  randomInt,
  isString,
  fixBoolean,
  randomItem
}