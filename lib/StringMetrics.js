/*
 * Copyright (C) 2012 Cedric Liegeois.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var StringMetrics = function() {'use strict'

	/**
	 * Returns a two-dimensional array whose number or rows is n and
	 * number of columns is m.
	 *
	 * @param {int} n number of rows
	 * @param {int} m number of columns
	 * @return a two-dimensional array whose number or rows is n and
	 * number of columns is m.
	 */
	function createArray(n, m) {
		var result = new Array(n);
		for (var i = 0; i < n; i++) {
			result[i] = new Array(m);
		}
		return result;
	};

	/**
	 * Returns the minimum value of a, b and c.
	 *
	 * @param {int} a first int
	 * @param {int} b second int
	 * @param {int} c third int
	 * @return the minimum value of a, b and c
	 */
	function min(a, b, c) {
		return Math.min(a, Math.min(b, c));
	};

	/**
	 * The Levenshtein distance between two strings is defined as the minimum number of edits needed to transform
	 * one string into the other, with the allowable edit operations being insertion, deletion, or substitution of
	 * a single character.
	 *
	 * @param {String} sSource first string
	 * @param {String} sTarget second string
	 * @return the Levenshtein distance between the two specified strings
	 * @see http://en.wikipedia.org/wiki/Levenshtein_distance
	 */
	function levenshteinDistance(sSource, sTarget) {
		var source = sSource.split("");
		var target = sTarget.split("");
		var sourceLen = source.length;
		var targetLen = target.length;

		var distance = createArray(sourceLen + 1, targetLen + 1);
		var i = 0;
		var j = 0;
		for (i = 0; i <= sourceLen; i++) {
			distance[i][0] = i;
		}
		for (j = 1; j <= targetLen; j++) {
			distance[0][j] = j;
		}

		for (i = 1; i <= sourceLen; i++) {
			for (j = 1; j <= targetLen; j++) {
				var cost = (source[i - 1] === target[j - 1]) ? 0 : 1;
				distance[i][j] = min(distance[i - 1][j] + 1, distance[i][j - 1] + 1, distance[i - 1][j - 1] + cost);
			}
		}

		return distance[sourceLen][targetLen];
	};

	/**
	 * The Damerau–Levenshtein distance (named after Frederick J. Damerau and Vladimir I. Levenshtein) is a "distance"
	 * (string metric) between two strings, i.e., finite sequence of symbols, given by counting the minimum number of
	 * operations needed to transform one string into the other, where an operation is defined as an insertion, deletion,
	 * or substitution of a single character, or a transposition of two adjacent characters.
	 *
	 * @param {String} sSource  first string
	 * @param {String} sTarget  second string
	 * @return the Damerau-Levenshtein distance between the two specified strings
	 * @see http://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
	 */
	function damerauLevenshteinDistance(sSource, sTarget) {

		var alphabet = [];

		var source = sSource.split("");
		var target = sTarget.split("");
		var sourceLen = source.length;
		var targetLen = target.length;

		if (sourceLen === 0) {
			if (targetLen === 0) {
				return 0;
			} else {
				return targetLen;
			}
		} else if (sourceLen === 0) {
			return sourceLen;
		}

		var score = createArray(sourceLen + 2, targetLen + 2);

		var INF = sourceLen + targetLen;
		score[0][0] = INF;
		var i = 0;
		var j = 0;
		for (i = 0; i <= sourceLen; i++) {
			score[i + 1][1] = i;
			score[i + 1][0] = INF;
		}

		for (j = 0; j <= targetLen; j++) {
			score[1][j + 1] = j;
			score[0][j + 1] = INF;
		}

		var global = (sSource + sTarget).split("");
		var globalLen = global.length;
		for (var i = 0; i < globalLen; i++) {
			alphabet[global[i]] = 0;
		}

		for (i = 1; i <= sourceLen; i++) {
			var DB = 0;
			for (j = 1; j <= targetLen; j++) {
				var i1 = alphabet[target[j - 1]];
				var j1 = DB;

				if (source[i - 1] === target[j - 1]) {
					score[i + 1][j + 1] = score[i][j];
					DB = j;
				} else {
					score[i + 1][j + 1] = min(score[i][j], score[i + 1][j], score[i][j + 1]) + 1;
				}

				score[i + 1][j + 1] = Math.min(score[i + 1][j + 1], score[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1));
			}

			alphabet[source[i - 1]] = i;
		}

		return score[sourceLen + 1][targetLen + 1];
	};

	function diceCoefficient(sSource, sTarget) {
		var intersection = 0;
		var sourceLen = sSource.length - 1;
		var targetLen = sTarget.length - 1;
		if (sourceLen < 1 || targetLen < 1) {
			return 0;
		}

		var i = 0;
		var j = 0;
		
		var bigramsTarget = [];
		for (i = 0; i < targetLen; i++) {
			bigramsTarget.push(sTarget.substr(i, 2));
		}
		for (i = 0; i < sourceLen; i++) {
			var bigramSource = sSource.substr(i, 2);
			for (j = 0; j < targetLen; j++) {
				if (bigramSource === bigramsTarget[j]) {
					intersection++;
					bigramsTarget[j] = null;
					break;
				}
			}
		}
		return (2.0 * intersection) / (sourceLen + targetLen);
	};

	function compareToThreshold(distance, naturalOrder, threshold) {
		return naturalOrder ? distance <= threshold : distance >= threshold;
	};

	function match(sSource, sTarger, computer, naturalOrder, threshold) {
		if ( typeof threshold === 'undefined') {
			throw new TypeError("Threshold must be defined.");
		}
		var distance = computer.call(this, sSource, sTarger);
		return compareToThreshold(distance, naturalOrder, threshold);
	};

	function sort(elems, elem, computer, naturalOrder, threshold) {
		var threshold = threshold || ( naturalOrder ? Number.MAX_VALUE : 0);

		var distances = [];
		var length = elems.length;
		var lcElem = elem.toLowerCase();
		var i = 0;
		
		for (i = 0; i < length; i++) {
			var distance = computer.call(this, elems[i].toLowerCase(), lcElem);
			var keep = compareToThreshold(distance, naturalOrder, threshold);
			if (keep) {
				var entry = {
					key : elems[i],
					value : distance
				};
				distances.push(entry);
			}
		}

		distances.sort(function(a, b) {
			var diff = a.value - b.value;
			if (!naturalOrder) {
				diff = -diff;
			}
			return diff;
		});
		var result = [];
		length = distances.length;
		for (i = 0; i < length; i++) {
			result.push(distances[i].key);
		}
		return result;
	};

	/**
	 * StringMetric definition. Each StringMetric provides the following methods:
	 * <ul>
	 * <li>compute
	 * <li>match
	 * <li>sort
	 * </ul>
	 *
	 * @param {function} computer the actual string metric computer
	 * @param {Boolean} naturalOrder true if the greater the distance between two strings the less identical
	 * they are - or the more "appart". Levenshtein and affiliated distances follow the natural order (distance 0 means same string),
	 * whereas Dice's Coefficient does not (max coefficient 1.0 means same string).
	 */
	var StringMetric = function(computer, naturalOrder) {
		return {

			/**
			 * Returns the value of the parent string metric between the two specified {String}s.
			 *
			 * @param {String} source  first string
			 * @param {String} target  second string
			 * @return the value of the parent string metric between the two specified {String}s
			 */
			compute : function(source, target) {
				return computer(source, target);
			},

			/**
			 * Returns <code>true</code> if the distance between the two specified {String}s is
			 * <ul>
			 * <li>above or equal to the specified threshold for non-natural ordered metrics
			 * <li>below or equal to the specified threshold for natural ordered metrics
			 * </ul>
			 *
			 * @param {String} source  first string
			 * @param {String} target  second string
			 * @param {Integer} threshold the threshold for distance comparison
			 * @return the specified two {String}s match
			 */
			match : function(source, target, threshold) {
				return match(source, target, this.compute, naturalOrder, threshold);
			},

			/**
			 * Returns the specified elements sorted based on the distance to the specified elem.
			 * A new array will be returned.
			 * Only elements matching the threshold will be kept in the returned
			 * array (see #match(source, target, threshold)).
			 * Elements are sorted according to whether the distance is natural ordered or not.
			 *
			 * @param {Array} elems elements to be sorted
			 * @param {String} element of reference
			 * @param {Integer} threshold the threshold for distance comparison. If omitted, 0 is used for
			 * non-natural distance and MAX_INTEGER for natural distance.
			 * @return the elements sorted
			 */
			sort : function(elems, elem, threshold) {
				return sort(elems, elem, this.compute, naturalOrder, threshold);
			},
		};
	};

	// API
	return {

		/**
		 * The Levenshtein distance between two strings is defined as the minimum number of
		 * edits needed to transform one string into the other, with the allowable edit operations
		 * being insertion, deletion, or substitution of a single character.
		 *
		 * @see http://en.wikipedia.org/wiki/Levenshtein_distance
		 */
		levenshtein : function() {
			return new StringMetric(levenshteinDistance, true);
		},

		/**
		 * The Damerau–Levenshtein distance (named after Frederick J. Damerau and Vladimir I. Levenshtein)
		 * is a "distance" (string metric) between two strings, i.e., finite sequence of symbols,
		 * given by counting the minimum number of operations needed to transform one string into
		 * the other, where an operation is defined as an insertion, deletion,
		 * or substitution of a single character, or a transposition of two adjacent characters.
		 *
		 * @see http://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
		 */
		damerauLevenshtein : function() {
			return new StringMetric(damerauLevenshteinDistance, true);
		},

		dice : function() {
			return new StringMetric(diceCoefficient, false);
		}
	};
};
