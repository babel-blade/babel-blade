var handler = {
  get: function(obj, prop) {
    return prop in obj ? obj[prop] : 37;
  }
};

var p = new Proxy({}, handler); // p is a meta-object
p.a = 1;
p.b = undefined;

console.log(p.a, p.b); // 1, undefined
console.log("c" in p, p.c); // false, 37
