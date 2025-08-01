// SM2 algorithm for spaced repetition
// quality: 0 (complete blackout) to 5 (perfect response)
function sm2({ previousEF = 2.5, previousInterval = 1, previousRepetition = 0, quality }) {
  let ef = previousEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;
  let repetition = quality < 3 ? 0 : previousRepetition + 1;
  let interval;
  if (repetition <= 1) interval = 1;
  else if (repetition === 2) interval = 6;
  else interval = Math.round(previousInterval * ef);
  return { ef, interval, repetition };
}

module.exports = sm2; 