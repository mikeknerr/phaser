import axios from 'axios';
// const playlists = {
//   comeUp: '4VMptwsberF0TqhWpZaVFS',
//   peak: '6V5LVOTblTIU5JM71WYHvi',
//   comeDown: '2F8FNWUNufbDkKtbtP53o5',
// }

const getMsFromMins = (mins) => {
  return mins * 60 * 1000;
}

const getPhaseDurations = (phaseInfo) => {
  return phaseInfo.map(info => getMsFromMins(info.duration));
}

const getPlaylistIds = (phaseInfo) => {
  return phaseInfo.map(info => {
    if (info.playlist.includes('spotify')) {
      const uri = info.playlist.split(':');
      return uri[uri.length - 1];
    } else {
      return info.playlist
    }
  });
}

const getSpotify = (token) => {
  return axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: {'Authorization': `Bearer ${token}`}
  });
}

export async function getUserPlaylists(token) {
  const spotify = getSpotify(token);
  let morePlaylists = true;
  let offset = 0;
  const playlists = [];
  for (let x = 0; x < 10; x++) {
    const newPlaylists = await spotify.get(`/me/playlists?limit=50&offset=${offset}`);
    if (newPlaylists.data.items.length < 50) {
      morePlaylists = false;
    }
    playlists.push(...newPlaylists.data.items)
    offset += newPlaylists.data.items.length;
  }
  return playlists;
}

export async function startScript(token, playlistName, phaseInfo) {
  const spotify = getSpotify(token);

  const user = await spotify.get('/me');
  const userId = user.data.id;

  const playlistIds = getPlaylistIds(phaseInfo);
  const phaseTracks = [];

  for (let playlistId of playlistIds) {
    const trackRes = await spotify.get(`/playlists/${playlistId}/tracks`);
    const tracks = trackRes.data.items.map(item => item.track);
    phaseTracks.push(tracks);
  }
  const durations = getPhaseDurations(phaseInfo);

  let tracksToAdd = [];
  for (let i = 0; i < phaseTracks.length; i++) {
    let duration = 0;
    while (duration < durations[i]) {
      if (!phaseTracks[i].length) {
        break;
      }
      let track = phaseTracks[i].splice(Math.floor(Math.random() * phaseTracks[i].length), 1)[0];
      tracksToAdd.push(track.uri);
      duration += track.duration_ms;
    }
  }
  
  const newPlaylistDetails = JSON.stringify({
    name: playlistName || 'New Phaser Playlist',
    public: false,
  })

  const newPlaylist = await spotify.post(`/users/${userId}/playlists`, newPlaylistDetails)
  const newPlaylistId = newPlaylist.data.id;

  const result = await spotify.post(`/playlists/${newPlaylistId}/tracks`, JSON.stringify(tracksToAdd));
  return result;
}

//TODO:
// - Add success and failure messages
// - display lists of their playlists for them to search from
// - Change color scheme to Spotify's and maybe use their button format too
// - Remove stepper arrows
// - Change submit button colord
// - Ability to search playlists by name