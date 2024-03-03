var VEML6075 = function(i2c,opts) {
  // VIS and IR coefficients for a non-covered (i.e. open-air, non-diffused -> no glass
  // or teflon filter) designs like the Adafruit breakout, as per the VEML6075 datasheet:
  this.uva_a_coef = 2.22; // Default value for the UVA VIS coefficient ("a")
  this.uva_b_coef = 1.33; // Default value for the UVA IR coefficient ("b")
  this.uvb_c_coef = 2.95; // Default value for the UVB VIS coefficient ("c")
  this.uvb_d_coef = 1.74; // Default value for the UVB IR coefficient ("d")
  this.uva_resp = 0.001461; // UVA response
  this.uvb_resp = 0.002591; // UVB response
  
  this.I2C_BUS = 0;
  this.I2C_ADDRESS_VEML6075 = 0;
  this.data = [];

  this.Identify(i2c,opts.address);
  this.Start();

}

VEML6075.prototype.Identify = function (bus,address) {
	if (this.I2C_ADDRESS_VEML6075 > 0) return false;

	// Identify using the device ID (0x26) of the VEML6075 device...
	var deviceID = bus.readWordSync(address, 0x0c);
	if ((deviceID & 0xff) == 0x26) {
		this.I2C_BUS = bus;
		this.I2C_ADDRESS_VEML6075 = address;
		return true;
	}
	else {
    return false;      
  }
}

VEML6075.prototype.IsAvailable = function () {
	if (this.I2C_ADDRESS_VEML6075) {
    return true;
  }
	else {
    return false;
  } 
}

VEML6075.prototype.Start = function () {
	// Configure the device...
	this.I2C_BUS.writeByteSync(this.I2C_ADDRESS_VEML6075, 0x00, 0b00000001); // Power off ("shut down")
	this.I2C_BUS.writeByteSync(this.I2C_ADDRESS_VEML6075, 0x00, 0b00000000); // Power on, normal (continuous) mode, 50 ms integration time, normal dynamic range
}

VEML6075.prototype.Stop = function () {
	this.I2C_BUS.writeByteSync(this.I2C_ADDRESS_VEML6075, 0x00, 0b00000001); // Power off ("shut down")
}

VEML6075.prototype.Get = async function () {
	var uva = await this.I2C_BUS.readWordSync(this.I2C_ADDRESS_VEML6075, 0x07); // Uncalibrated UVA
	var uvb = await this.I2C_BUS.readWordSync(this.I2C_ADDRESS_VEML6075, 0x09); // Uncalibrated UVB
	var uvcomp1 = await this.I2C_BUS.readWordSync(this.I2C_ADDRESS_VEML6075, 0x0a); // UV compensation value 1
	var uvcomp2 = await this.I2C_BUS.readWordSync(this.I2C_ADDRESS_VEML6075, 0x0b); // UV compensation value 2

	// === Passing on a note by Adafruit: "INDOORS with office
	// lighting you may get VERY LOW or even NEGATIVE values." ===

	var uva_adjusted = Math.round(uva - (this.uva_a_coef * uvcomp1) - (this.uva_b_coef * uvcomp2));
	// if (uva_adjusted < 0) uva_adjusted = 0; // Allowing negative UVA values to be displayed (for now at least)
	var uvb_adjusted = Math.round(uvb - (this.uvb_c_coef * uvcomp1) - (this.uvb_d_coef * uvcomp2));
	// if (uvb_adjusted < 0) uvb_adjusted = 0; // Allowing negative UVB values to be displayed (for now at least)

	var uv_index = ((uva_adjusted * this.uva_resp) + (uvb_adjusted * this.uvb_resp)) / 2;
    if (uv_index < 0) uv_index = 0;
    
    var uv_index_level = 0;
    if (uv_index > 10.9) uv_index_level = 5; // EXTREME
    else if (uv_index > 7.9) uv_index_level = 4; // VERY HIGH
    else if (uv_index > 5.9)  uv_index_level = 3; // HIGH
    else if (uv_index > 2.9)  uv_index_level = 2; // MODERATE
    else uv_index_level = 1; // LOW

	// if (showDebug) console.log("Breakout Gardener -> DEBUG (VEML6075) -> %s %s %s %s | %s %s | %s (level %s)", uva, uvb, uvcomp1, uvcomp2, uva_adjusted, uvb_adjusted, uv_index, uv_index_level);

	this.data.push({
    "uva_adjusted":uva_adjusted, 
    "uvb_adjusted":uvb_adjusted,
    "uv_index":uv_index, 
    "uv_index_level":uv_index_level
    });
  
  //console.log(this.data);
	return this.data;
}

module.exports = VEML6075;