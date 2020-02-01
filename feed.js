/**
 * A script that searches for podcasts, parses their RSS feed & downloads
 * them for later use in index.js (podcast radio script).
 * 
 * Relevant links:
 * 		https://www.npr.org/rss/podcast.php?id=510325
 * 		https://feeds.megaphone.fm/darknetdiaries
 * 		https://www.listennotes.com/api/docs/
 * 		http://podplanet.libsyn.com/rss
 * 
 * TODO:
 * 		Search for podcasts using the the listennotes API, & download them for
 * 		later.
 */

const podcastFeedParser = require("podcast-feed-parser")
const http = require('http');
const fs = require('fs');

// for fetching remote feeds, use getPodcastFromURL.
// Note that function must be async
async function printPodcastTitle (url) {
	const podcast = await podcastFeedParser.getPodcastFromURL(url)
	console.log(podcast.meta.title)
	
	podcast.episodes.forEach( (episode) => {
		console.log(episode.enclosure.url)
		const file = fs.createWriteStream(`audio/downloads/${(episode.title.replace( /[\s\|]/g, ""))}-${episode.enclosure.length}.mp3`);
		const request = http.get( episode.enclosure.url, function(response) {
  			response.pipe(file);
		});
	});
}

printPodcastTitle('http://podplanet.libsyn.com/rss')


