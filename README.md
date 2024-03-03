# VEML6075 nodejs lib

VEML6075 from Vishay is an UVA UVB and UV_INDEX sensor.

Here is the setup i found in an old project, not being able to challenge it for now:

VIS and IR coefficients for a non-covered (i.e. open-air, non-diffused -> no glass
or teflon filter) designs like the Adafruit breakout, as per the VEML6075 datasheet:
- uva_a_coef = 2.22; // Default value for the UVA VIS coefficient ("a")
- uva_b_coef = 1.33; // Default value for the UVA IR coefficient ("b")
- uvb_c_coef = 2.95; // Default value for the UVB VIS coefficient ("c")
- uvb_d_coef = 1.74; // Default value for the UVB IR coefficient ("d")
- uva_resp = **0.001461; // UVA response
- uvb_resp = **0.002591; // UVB response

- uva_adjusted = Math.round(uva - (this.uva_a_coef * uvcomp1) - (this.uva_b_coef * uvcomp2));
- uvb_adjusted = Math.round(uvb - (this.uvb_c_coef * uvcomp1) - (this.uvb_d_coef * uvcomp2));
- uv_index = ((uva_adjusted * this.uva_resp) + (uvb_adjusted * this.uvb_resp)) / 2;

### Dependencies
Using **I2C** to communicate with device, use **i2c-bus** library

### Get() 
function returns array with 4 values :
- uva_adjusted
- uvb_adjusted
- uv_index
- uv_index_level


```
const i2c = require('i2c-bus');
const veml = require('veml6075');

var opts = {
  address:0x10
}

const i2cBus = i2c.openSync(1);
var veml_ = new veml(i2cBus,opts);
  
var result = veml_.Get();

console.log(result);
```
