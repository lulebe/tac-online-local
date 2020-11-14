if (!Array.prototype.last) {
  Array.prototype.last = function (index) {
    return this[this.length - 1 - (index || 0)]
  }
}


function clone(obj) {
  var copy
  if (null == obj || "object" != typeof obj) return obj
  if (obj instanceof Array) {
      copy = []
      for (var i = 0; i < obj.length; i++) {
          copy[i] = clone(obj[i])
      }
      return copy
  }
  if (obj instanceof Object) {
      copy = {}
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr])
      }
      return copy
  }
  throw new Error("Unable to copy obj! Its type isn't supported.")
}