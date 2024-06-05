export const sineGenerator = (
  nFreq,
  nPoints,
  nAmplitude,
) => {
  let genData = [];
  let x = 0;
  let k = 0;
  let pts = {
    indx: 0,
    sValue: 0.0,
    sFreq: 0.0,
  };

  for (let i = 0; i < nPoints; i++) {
    k = i === 0 ? 0 : x + Math.PI / nFreq;
    pts = {
      indx: i,
      sValue: k,
      sFreq: Math.sin(k),
    };
    genData.push(pts);
    x = k;
    // reset object
    pts = {}; // this line seems to generate an error for clearing an object.
  }
  return genData;
};
