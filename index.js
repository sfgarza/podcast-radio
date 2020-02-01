/**
 * A nodejs program that emulates the look, feel, & sound of an old school radio.
 * Tune into a different podcast by pressing the button & adjust volume by turning 
 * the dial. The script will tune into a random section of the track in order to
 * emulate the experience of tuning into different radio stations.
 * 
 * Radio tuning sound effects used:
 *      https://www.youtube.com/watch?v=b2qShK5lZOs
 *      https://www.youtube.com/watch?v=5NZvTVLMBb8
 * 
 * Relevant links:
 *      https://linuxize.com/post/how-to-install-node-js-on-raspberry-pi/
 *      https://www.quora.com/How-do-we-determine-frame-rate-of-mp3-audio-files
 * 
 */

/**
 * Setup modules and global variables.
 */
const Gpio = require('onoff').Gpio;
const button = new Gpio(4, 'in', 'rising', {debounceTimeout: 100});
const { fork } = require('child_process');
const volumeproc = fork('volume.js'); // Run script for adjusting volume as a child process
const FPS = 38; // mp3 frame rate = 38.46
var player = require('play-sound')(opts = {
    players: [
        'mpg321', // Make sure to install by running "sudo apt-get install mpg321".
       ]});

var current_track,
    searching = false;

/**
 * Run Script.
 */ 
(async()=>{
    // Start playing on script boot.
    current_track = await tuneToTrack();

    // Change channel on button press.
    button.watch(async(err, value) => {
  	    if (err) {
 	        throw err;
        }

        
        if(value === 1){
            searching = true; 
            if( current_track ){
                current_track.kill();
            }
            current_track = await tuneToTrack();
            searching = false;
        }
    });
})();

/********************************************************************
 *                       Function Declarations.                     *
 ********************************************************************/

async function tuneToTrack(playthis){
    // Only changes channel when not currently changing channels.
    if( searching === false ){ 
        // Play old fashioned radio tuning effect for ~3 seconds.
        var which = Math.floor(Math.random() * 2) + 1
        var tuning = await player.play( `audio/effects/radiotuning${which}.mp3`,{ mpg321 : ['-k',getRandomFrame( 12 ), '-l', 0 ] })
        await delay(3000);

        // Play random podcast if none selected.
        if(typeof playthis !== 'object'){
            playthis = getRandomTrack();
        }

        // Play podcast at randomly selected time.
        current_track = await player.play( playthis.track ,{ mpg321 : ['-k', getRandomFrame( playthis.duration )], whatNext } )
        current_track.on('exit',whatNext) ;// Queue another podcast when its done playing (infinitely loops).
        
        // Wait half a second before killing tuning noise for effect.
        await delay(500);
        killTrack(tuning);

        return current_track;
    }
}

/**
 * Play next track callback function.
 */
async function whatNext(){
    console.log('next');
    if(!searching){
        current_track = await tuneToTrack();
    }
}

/**
 * Synchronous delay function.
 * @param {*} t 
 * @param {*} val 
 */
function delay(t, val) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
}

/**
 * Get random frame to skip to.
 * @param {*} duration 
 */
function getRandomFrame ( duration ) {
     return Math.floor(Math.random() * ( duration * FPS )); // Convert duration to total Frames in track by multiplying duration by FPS  
}

/**
 * Kill the track.
 * @param {*} track 
 */
function killTrack(track){
    setTimeout(function(){
        track.kill();
    },1000);
}

/**
 * Get random track to listen to.
 * 
 * TODO: Get tracks downloaded by feed.js cronjob.
 *       Keep track of items already played in order avoid
 *       replaying tracks.
 */
function getRandomTrack(){
    var tracks = [
        {
         duration : 60,
         track: 'http://wsodprogrf.bbc.co.uk/bd/tx/bbcminute/mp3/bbcminute2001280630.mp3'
        },
        {
          duration : 60,
          track: 'http://wsodprogrf.bbc.co.uk/bd/tx/bbcminute/mp3/bbcminute2001282300.mp3'
        },
        {
          duration : 599,
          track: 'audio/downloads/msmon.mp3'
        },
        {
            duration : 300,
            track: 'audio/downloads/newsnow.mp3'
        },
        {
            duration : 164,
            track: 'audio/downloads/wired.mp3'
        },
        {
            duration : 184,
            track: 'audio/downloads/wired2.mp3'
        },
        {
            duration : 2770,
            track: 'audio/downloads/dark.mp3'
        },
        {
            duration : 112484230,
            track: 'audio/downloads/A700-FootMountainofWhippedCream-112484230.mp3'
        },
        {
            duration : 42620300,
            track: 'audio/downloads/Season2Episode15NikitaPartTwo-42620300.mp3'
        }

    ];

    return tracks[Math.floor(Math.random()*tracks.length)]
}
