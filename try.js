
var arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 6 };
var element = 6;
var index = Array.prototype.indexOf.call(arrayLike, element);

console.log(index); // 输出: -1