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
 */'use strict'

var StringMetrics = function() {

	/**
	 * Returns a two-dimensional array whose number or rows is n and
	 * number of columns is m.
	 *
	 * @param {int} n number of rows
	 * @param {int} m number of columns
	 * @return a two-dimensional array whose number or rows is n and
	 * number of columns is m.
	 */
	this.createArray = function(n, m) {
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
	this.min = function(a, b, c) {
		return Math.min(a, Math.min(b, c));
	};

}

StringMetrics.prototype = {

	sorter : function() {

		var Sorter = function(stringMetrics) {
			this.options = 'undefined';
			this.strm = stringMetrics;
		}

		Sorter.prototype = {

			metric : function(metric) {
				if (this.options == 'undefined') {
					this.options = {};
				}
				this.options.metric = metric;
				return this;
			},

			threshold : function(threshold) {
				if (this.options == 'undefined') {
					this.options = {};
				}
				this.options.threshold = threshold;
				return this;
			},

			sort : function(elems, elem) {
				return this.strm.sort(elems, elem, this.options);
			}
		}

		return new Sorter(this);

	},

	sort : function(elems, elem, options) {
		var hasOptions = typeof options != 'undefined';
		var metric = hasOptions && options.metric || this.levenshtein;
		var computer = metric.call(this).compute;
		var naturalOrder = metric.call(this).isNaturalOrder;
		var threshold = hasOptions && options.threshold || ( naturalOrder ? Number.MAX_VALUE : 0);

		var distances = new Array();
		var length = elems.length;
		var lcElem = elem.toLowerCase();
		for (var i = 0; i < length; i++) {
			var distance = computer.call(this, elems[i].toLowerCase(), lcElem);
			var entry = {
				key : elems[i],
				value : distance
			};
			distances.push(entry);
		}

		distances.sort(function(a, b) {
			var diff = a.value - b.value;
			if (!naturalOrder) {
				diff = -diff;
			}
			return diff;
		});
		var result = new Array();
		for (var i = 0; i < length; i++) {
			console.log(distances[i].key + " => " + distances[i].value);
			var keep = naturalOrder ? distances[i].value < threshold : distances[i].value > threshold;
			if (keep) {
				result.push(distances[i].key);
			}
		}
		return result;
	},

	levenshtein : function() {
		var that = this;
		return {
			compute : function(sSource, sTarget) {
				return that.levenshteinDistance(sSource, sTarget)
			},
			isNaturalOrder : true
		}
	},

	damerauLevenshtein : function() {
		var that = this;
		return {
			compute : function(sSource, sTarget) {
				return that.damerauLevenshteinDistance(sSource, sTarget)
			},
			isNaturalOrder : true
		}
	},

	dice : function() {
		var that = this;
		return {
			compute : function(sSource, sTarget) {
				return that.diceCoefficient(sSource, sTarget)
			},
			isNaturalOrder : false
		}
	},

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
	levenshteinDistance : function(sSource, sTarget) {
		var source = sSource.split("");
		var target = sTarget.split("");
		var sourceLen = source.length;
		var targetLen = target.length;

		var distance = this.createArray(sourceLen + 1, targetLen + 1);

		for (var i = 0; i <= sourceLen; i++) {
			distance[i][0] = i;
		}
		for (var j = 1; j <= targetLen; j++) {
			distance[0][j] = j;
		}

		for (var i = 1; i <= sourceLen; i++) {
			for (var j = 1; j <= targetLen; j++) {
				var cost = (source[i - 1] == target[j - 1]) ? 0 : 1;
				distance[i][j] = this.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1, distance[i - 1][j - 1] + cost);
			}
		}

		return distance[sourceLen][targetLen];
	},

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
	damerauLevenshteinDistance : function(sSource, sTarget) {

		var alphabet = new Array();

		var source = sSource.split("");
		var target = sTarget.split("");
		var sourceLen = source.length;
		var targetLen = target.length;

		if (sourceLen == 0) {
			if (targetLen == 0) {
				return 0;
			} else {
				return targetLen;
			}
		} else if (sourceLen == 0) {
			return sourceLen;
		}

		var score = this.createArray(sourceLen + 2, targetLen + 2);

		var INF = sourceLen + targetLen;
		score[0][0] = INF;
		for (var i = 0; i <= sourceLen; i++) {
			score[i + 1][1] = i;
			score[i + 1][0] = INF;
		}

		for (var j = 0; j <= targetLen; j++) {
			score[1][j + 1] = j;
			score[0][j + 1] = INF;
		}

		var global = (sSource + sTarget).split("");
		var globalLen = global.length;
		for (var i = 0; i < globalLen; i++) {
			alphabet[global[i]] = 0;
		}

		for (var i = 1; i <= sourceLen; i++) {
			var DB = 0;
			for (var j = 1; j <= targetLen; j++) {
				var i1 = alphabet[target[j - 1]];
				var j1 = DB;

				if (source[i - 1] == target[j - 1]) {
					score[i + 1][j + 1] = score[i][j];
					DB = j;
				} else {
					score[i + 1][j + 1] = this.min(score[i][j], score[i + 1][j], score[i][j + 1]) + 1;
				}

				score[i + 1][j + 1] = Math.min(score[i + 1][j + 1], score[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1));
			}

			alphabet[source[i - 1]] = i;
		}

		return score[sourceLen + 1][targetLen + 1];
	},

	diceCoefficient : function(sSource, sTarget) {
		var intersection = 0;
		var sourceLen = sSource.length - 1;
		var targetLen = sTarget.length - 1;
		if (sourceLen < 1 || targetLen < 1) {
			return 0;
		}

		var bigramsTarget = [];
		for (var i = 0; i < targetLen; i++) {
			bigramsTarget.push(sTarget.substr(i, 2));
		}
		for (var i = 0; i < sourceLen; i++) {
			var bigramSource = sSource.substr(i, 2);
			for (var j = 0; j < targetLen; j++) {
				if (bigramSource == bigramsTarget[j]) {
					intersection++;
					bigramsTarget[j] = null;
					break;
				}
			}
		}
		return (2.0 * intersection) / (sourceLen + targetLen);
	}
}
