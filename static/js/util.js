if (!Array.prototype.last) {
  Array.prototype.last = function (index) {
    return this[this.length - 1 - (index || 0)]
  }
}