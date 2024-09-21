/*===========================================================================*\
 * Fast Fourier Transform (Cooley-Tukey Method)
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/
// This module exports fast fourier transformation functions.
export { fft, fftInPlace } from './fft/fft.js';
//------------------------------------------------
// Note: Some of this code is not optimized and is
// primarily designed as an educational and testing
// tool.
// To get high performace would require transforming
// the recursive calls into a loop and then loop
// unrolling. All of this is best accomplished
// in C or assembly.
//-------------------------------------------------

//-------------------------------------------------
// The following code assumes a complex number is
// an array: [real, imaginary]
//-------------------------------------------------
import {
  complexAdd,
  complexMultiply,
  complexSubtract,
} from './complex.js';
import { exponent } from './fftutil.js';
import {
  countTrailingZeros,
  reverse,
  INT_BITS,
} from './bitTwiddle/twiddle.js';
//-------------------------------------------------
// Calculate FFT for vector where vector.length
// is assumed to be a power of 2.
//-------------------------------------------------
export const fft = (vector) => {
  var X = [],
    N = vector.length;
  console.log('here is vector : ' + vector);
  // Base case is X = x + 0i since our input is assumed to be real only.
  if (N == 1) {
    if (Array.isArray(vector[0]))
      //If input vector contains complex numbers
      return [[vector[0][0], vector[0][1]]];
    else return [[vector[0], 0]];
  }

  // Recurse: all even samples
  var X_evens = fft(vector.filter(even)),
    // Recurse: all odd samples
    X_odds = fft(vector.filter(odd));

  // Now, perform N/2 operations!
  for (let k = 0; k < N / 2; k++) {
    // t is a complex number!
    var t = X_evens[k],
      e = complexMultiply(exponent(k, N), X_odds[k]);

    X[k] = complexAdd(t, e);
    X[k + N / 2] = complexSubtract(t, e);
  }

  function even(__, ix) {
    return ix % 2 == 0;
  }

  function odd(__, ix) {
    return ix % 2 == 1;
  }

  return X;
};
//-------------------------------------------------
// Calculate FFT for vector where vector.length
// is assumed to be a power of 2.  This is the in-
// place implementation, to avoid the memory
// footprint used by recursion.
//-------------------------------------------------
export const fftInPlace = (vector) => {
  var N = vector.length;

  var trailingZeros = countTrailingZeros(N); //Once reversed, this will be leading zeros

  // Reverse bits
  for (var k = 0; k < N; k++) {
    var p = reverse(k) >>> (INT_BITS - trailingZeros);
    if (p > k) {
      var complexTemp = [vector[k], 0];
      vector[k] = vector[p];
      vector[p] = complexTemp;
    } else {
      vector[p] = [vector[p], 0];
    }
  }

  //Do the DIT now in-place
  for (var len = 2; len <= N; len += len) {
    for (var i = 0; i < len / 2; i++) {
      var w = exponent(i, len);
      for (var j = 0; j < N / len; j++) {
        var t = complexMultiply(
          w,
          vector[j * len + i + len / 2],
        );
        vector[j * len + i + len / 2] = complexSubtract(
          vector[j * len + i],
          t,
        );
        vector[j * len + i] = complexAdd(
          vector[j * len + i],
          t,
        );
      }
    }
  }
};
