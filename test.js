process.env.TZ = 'Europe/Amsterdam';

var d = new Date(Date.now() + 3600000);
var e = new Date(); 

console.log ('D:', d);

console.log(d.getTimezoneOffset());
console.log(e.getTimezoneOffset()); 
