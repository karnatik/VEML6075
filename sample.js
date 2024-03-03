const i2c = require('i2c-bus');
const veml = require('veml6075');

var opts = {
	  address:0x10
}

const i2cBus = i2c.openSync(1);
var veml_ = new veml(i2cBus,opts);
  
var result = veml_.Get();

console.log(result);
