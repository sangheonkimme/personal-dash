const { parseQuickInput } = require('./lib/parsers/quick-input.ts');

const result1 = parseQuickInput('오늘 저녁 15000원 #식비', 'ko');
console.log('Test 1:', result1);

const result2 = parseQuickInput('저녁 30000원 카드 #식비', 'ko');
console.log('Test 2:', result2);
