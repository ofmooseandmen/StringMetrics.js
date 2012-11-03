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
	 * HashMap: container to associate a key with a value - the key being unique.
	 * API doc is based on JAVA HashMap javadoc.
	 */
	var HashMap = function() {
		this.arr = new Array();
	}

	HashMap.prototype = {

		/**
		 * Removes all of the mappings from this map.
		 * The map will be empty after this call returns.
		 */
		clear : function() {
			this.arr.length = 0;
		},

		/**
		 * Associates the specified value with the specified key in this map.
		 * If the map previously contained a mapping for
		 * the key, the old value is replaced by the specified value.
		 *
		 * @param {Object} key key with which the specified value is to be associated
		 * @param {Object} value value to be associated with the specified key
		 */
		put : function(key, value) {
			var entryToAdd = {
				_key : key,
				_value : value
			};
			var len = this.arr.length;
			var found = false;
			for (var i = 0; i < len; i++) {
				var entry = this.arr[i];
				if (entry._key == key) {
					this.arr[i] = entryToAdd;
					found = true;
					break;
				}
			}
			// entry not found add new entry at the end of array.
			if (!found) {
				this.arr.push(entryToAdd);
			}
		},

		/**
		 * Returns the value to which the specified key is mapped,
		 * or 'undefined' if this map contains no mapping for the key.
		 *
		 * @param {Object} key the key whose associated value is to be returned
		 * @return the value to which the specified key is mapped, or
		 *         'undefined' if this map contains no mapping for the key
		 */
		get : function(key) {
			var len = this.arr.length;
			for (var i = 0; i < len; i++) {
				var entry = this.arr[i];
				if (entry._key == key) {
					return entry._value;
				}
			}
			return 'undefined';
		}
	}

	this.alphabet = new HashMap();

}
StringMetrics.prototype = {

	agrep : function(elems, elem) {
		var distances = new Array();
		var length = elems.length;
		var lcElem = elem.toLowerCase();
		for (var i = 0; i < length; i++) {
			var distance = this.damerauLevenshteinDistance(elems[i].toLowerCase(), lcElem);
			var entry = {
				key : elems[i],
				value : distance
			};
			distances.push(entry);
		}
		distances.sort(function(a, b) {
			return a.value - b.value;
		});
		var result = new Array();
		for (var i = 0; i < length; i++) {
			result.push(distances[i].key);
		}
		return result;
	},

	diceCoefficient : function(string1, string2) {
		var intersection = 0;
		var length1 = string1.length - 1;
		var length2 = string2.length - 1;
		if (length1 < 1 || length2 < 1)
			return 0;
		var bigrams2 = [];
		for (var i = 0; i < length2; i++) {
			bigrams2.push(string2.substr(i, 2));
		}
		for (var i = 0; i < length1; i++) {
			var bigram1 = string1.substr(i, 2);
			for (var j = 0; j < length2; j++) {
				if (bigram1 == bigrams2[j]) {
					intersection++;
					bigrams2[j] = null;
					break;
				}
			}
		}
		return (2.0 * intersection) / (length1 + length2);
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

		var distance = this._createArray(sourceLen + 1, targetLen + 1);

		for (var i = 0; i <= sourceLen; i++) {
			distance[i][0] = i;
		}
		for (var j = 1; j <= targetLen; j++) {
			distance[0][j] = j;
		}

		for (var i = 1; i <= sourceLen; i++) {
			for (var j = 1; j <= targetLen; j++) {
				var cost = (source[i - 1] == target[j - 1]) ? 0 : 1;
				distance[i][j] = this._min(distance[i - 1][j] + 1, distance[i][j - 1] + 1, distance[i - 1][j - 1] + cost);
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

		this.alphabet.clear();

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

		var score = this._createArray(sourceLen + 2, targetLen + 2);

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
			this.alphabet.put(global[i], 0);
		}

		for (var i = 1; i <= sourceLen; i++) {
			var DB = 0;
			for (var j = 1; j <= targetLen; j++) {
				var i1 = this.alphabet.get(target[j - 1]);
				var j1 = DB;

				if (source[i - 1] == target[j - 1]) {
					score[i + 1][j + 1] = score[i][j];
					DB = j;
				} else {
					score[i + 1][j + 1] = this._min(score[i][j], score[i + 1][j], score[i][j + 1]) + 1;
				}

				score[i + 1][j + 1] = Math.min(score[i + 1][j + 1], score[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1));
			}

			this.alphabet.put(source[i - 1], i);
		}

		return score[sourceLen + 1][targetLen + 1];
	},

	/**
	 * Returns a two-dimensional array whose number or rows is n and
	 * number of columns is m.
	 *
	 * @param {int} n number of rows
	 * @param {int} m number of columns
	 * @return a two-dimensional array whose number or rows is n and
	 * number of columns is m.
	 */
	_createArray : function(n, m) {
		var result = new Array(n);
		for (var i = 0; i < n; i++) {
			result[i] = new Array(m);
		}
		return result;
	},

	/**
	 * Returns the minimum value of a, b and c.
	 *
	 * @param {int} a first int
	 * @param {int} b second int
	 * @param {int} c third int
	 * @return the minimum value of a, b and c
	 */
	_min : function(a, b, c) {
		return Math.min(a, Math.min(b, c));
	},
}
