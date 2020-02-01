/**
 * A script that reads and adjusts system volume with the use of the mcp3008 IC
 * and a potentiometer.
 * 
 * https://www.raspberrypi-spy.co.uk/2019/06/using-a-usb-audio-device-with-the-raspberry-pi/
 */
const mcpadc = require('mcp-spi-adc');
const loudness = require('loudness');

(async()=>{
    // Read & set current volume.
    var current_volume = await loudness.getVolume();

    // Listen to volumeknob on channel 4 of MCP3008
    const volumeknob = mcpadc.open(4, {speedHz: 20000}, err => {
      if (err) console.log( err );
    
      // Read & set volume every 50ms.
      setInterval(_ => {
        volumeknob.read((err, reading) => {
          if (err) throw  err;
    
          // Convert decimal value between 0 & 1 to an integer between 0 & 100.
          let newvolume = Math.trunc( reading.value * 100 ); 
    
          // Set new volume if they are different.
          if( newvolume !== current_volume){
              current_volume = newvolume;
              loudness.setVolume( newvolume );
          }
        });
      }, 50);
    });
})();