// Whole-word DTTOT matching: a listed name or alias matches when every one of its
// words appears as a whole word in the customer name (any order, case/accent-blind).
// Substring matching flagged ordinary names ("Faizal" vs "FAIZ", "Budi Santoso").
// One-word aliases are nicknames (JOHN, ADAM, UMAR): they only match a customer
// name that is exactly that word, or every "John ..." would be flagged.

function dttotWords(text) {
  return (text || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toUpperCase()
    .split(/[^A-Z0-9]+/).filter(Boolean);
}

function dttotRowMatches(customerName, row) {
  const customer = new Set(dttotWords(customerName));
  if (customer.size === 0) return false;
  const names = [row.name, ...(row.aliases || '').split(',')];
  return names.some((listed, i) => {
    const words = dttotWords(listed);
    if (!words.length) return false;
    if (i > 0 && words.length === 1 && customer.size > 1) return false;
    return words.every(w => customer.has(w));
  });
}

module.exports = { dttotWords, dttotRowMatches };
