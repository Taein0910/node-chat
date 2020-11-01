var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/player_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        playerVars: {
            rel: 0,
            playsinline: 1,
            vq: 'hd1080',
            autoplay: 1,
            loop: 1,
            controls: 1,
            autohide: 1,
            showinfo: 0,
            wmode: 'opaque'
        },
        videoId: 'XIMLoLxmTDw',
        events: {
            onReady: onPlayerReady,
        }
    })
}

function onPlayerReady(a) {
    a.target.mute(), player.playVideo();
    $("#videoTitle").html(player.getVideoData().title);

}

function toggleSound() {
    player.isMuted() ? player.unMute() : player.mute()
}


function playVideo(id) {
    player.loadVideoById(id);
}

function getDataById(id) {
    var ytApiKey = "..."; //
var videoId = id;

$.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + ytApiKey, function(data) {
  alert(data.items[0].snippet.title);
});
}

