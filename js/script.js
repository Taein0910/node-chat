var socket = io();
var username = $("#name").val();
var message = $("#message").val();

var videolist=[];

$(document).ready(function(){
    $(".videolist").hide();
    $(".settings").hide();
});

// url 에서 parameter 추출
function getParam(sname) {
    var params = location.search.substr(location.search.indexOf("?") + 1);
    var sval = "";
    params = params.split("&");
    for (var i = 0; i < params.length; i++) {
        temp = params[i].split("=");
        if ([temp[0]] == sname) { sval = temp[1]; }
    }
    return sval;
}

socket.emit('joinroom', { room: getParam("roomname") });


var selectedId;
var Youtubekey = "AIzaSyAEcxLMHrlz_Kkd2pPIMVd6kow01FFBE8E";

//var Youtubekey = "AIzaSyCRVbzOOPDS7zfXkz3hRcQ-wPT557m6yvI";

$(() => {
    $("#name").val(localStorage.getItem('username'));

    $("#send").click(() => {
        var username = $("#name").val();
        var message = $("#message").val();

        if (!username && !message) {
            alert('메시지를 입력해주세요.');
        } else if (!username && message) {
            alert('닉네임이 설정되어 있지 않습니다.');
        } else if (username && !message) {
            alert('메시지를 입력해주세요.');
        } else if (username && message) {
            console.log('Sending message from client');
            sendMessage({
                name: username,
                message: message
            });
        }

        $("#message").val('');

    })
    getMessages()
})
socket.on('message', addMessages)

function sendVideoId(id) {
    var key = "qr3dLL=bbqSfX--Q";
    var username = $("#name").val();

    if (!username && !id) {
        alert('URL을 입력해주세요.');
    } else if (!username && id) {
        alert('닉네임이 설정되어 있지 않습니다.');
    } else if (username && !id) {
        alert('URL을 입력해주세요.');
    } else if (username && id) {
        console.log('Sending message from client');
        sendMessage({
            name: username,
            message: "[shareUrl," + key + "]" + id
        });
    }

    $("#urlInput").val('');

}


function addMessages(message) {
    var username = $("#name").val();
    var adpater = JSON.stringify(message).toString();

    if (adpater.indexOf('[shareUrl,qr3dLL=bbqSfX--Q]') != -1) {
        var urlmsg = message.message.toString().replace("[shareUrl,qr3dLL=bbqSfX--Q]", "");
        $("#messages").append(`<a href="#ex2" onclick="javascript:getDataById('` + urlmsg + `');" rel="modal:open"><div class="infoMessage"><h4 style="background-color: rgba(104, 125, 153, 0.5);padding:10px 15px;border-radius:20px;">${message.name}님이 영상을 공유했습니다<br>여기를 눌러 확인하세요 ></h4></div></a>`);
        videolist.unshift(urlmsg);
        refreshList();
        

    } else if (message.name == username) {
        $("#messages").append(`<div class="msgBox me"><h4 class="bubble_username"> ${message.name} </h4> <p class="bubble_message"> ${message.message} </p></div>`)

    } else {
        $("#messages").append(`<div class="msgBox others"><h4 class="bubble_username"> ${message.name} </h4> <p class="bubble_message"> ${message.message} </p></div>`)

    }

    $('#messages').scrollTop($('.chatForm')[0].scrollHeight);



}

function refreshList() {
        $(".videolist").html(videolist.join());
    
}


function getMessages() {
    $.get('http://localhost:8080/messages', (data) => {
        data.forEach(addMessages);
    })
}

function sendMessage(message) {
    $.post('http://localhost:8080/messages', message)
}

function setUsername() {
    localStorage.setItem('username', $("#name").val());
    location.reload();
}



//youtube player 
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
        videoId: '7oXcnkD2HII',
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
    if(player.isMuted()) {
        player.unMute();
        $('#toggleSound_mute').show();
        $('#toggleSound_unmute').hide();
       
        
    } else {
        player.mute();
         $('#toggleSound_mute').hide();
        $('#toggleSound_unmute').show();
    } 
}


function playVideo(id) {
    player.loadVideoById(id);
    getDataById_forPlay(id);
}

function getDataById(id) {
    videoId = id.toString();
    selectedId = videoId;
    console.log(selectedId, videoId);


        $.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + Youtubekey, function(data) {
            var title = data.items[0].snippet.title;
            var description = data.items[0].snippet.description.substring(0, 115) + "...";
            var thumnail = data.items[0].snippet.thumbnails.default.url;
            $("#error").html('');

            $("#title").html(title);
            $("#description").html(description);
            $("#thumnail").attr("src", thumnail);
        });

}

function getDataById_forPlay(id) {
    videoId = id.toString();

    $.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + Youtubekey, function(data) {
        var title = data.items[0].snippet.title;
        $("#current_title").html(title);
    });
}



var getCurrentTime = setInterval(function() {
    var time = Math.round(player.getCurrentTime());
    var total = Math.round(player.getDuration());




    var getPercent = ((time / total) * 100);
    var animationLength = 100;

    $('.progress-bar').stop().animate({
        left: getPercent + '%'
    }, animationLength);

}, 1000);




const youTube_Search_URL = 'https://www.googleapis.com/youtube/v3/search';

function getList(searchTerm) {
    $.getJSON(youTube_Search_URL, {
            part: 'snippet',
            key: Youtubekey,
            regionCode: 'KR',
            q: searchTerm,
            maxResults: 10,
        },
        function(data) {
            if (data.pageInfo.totalResults === 0) {
                alert('No Results!');
            }
            displayResults(data.items);
        }
    );
}

function displayResults(videos) {
    let html = "";
    $.each(videos, function(index, video) {
        console.log(video.snippet.title);
        console.log(video.snippet.thumbnails.high.url);

        html = html +
            "<a href='#ex3' rel='modal:close' onclick='javascript:sendVideoId(\"" + video.id.videoId + "\")'><img class='search-result-thumnails' src='" + video.snippet.thumbnails.high.url + "'/>" +
            "<p class ='line-clamp'>" + video.snippet.title + "</p></a>";
    });
    $('.resultsBox ul').html(html);
}

function searchResults() {
    var query = $('#urlInput').val();
    if ((query.indexOf('http://') != -1 || query.indexOf('https://') != -1) && query.indexOf('youtu') != -1) {
        //유튜브 링크이면 id 추출해 공유
        var id = youtube_parser(query);
        $.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&key=" + Youtubekey, function(data) {
            if(data.includes(''))
            var html = '<img id="thumnail" style="float:left; width:20%; margin-right: 20px;" src="' + data.items[0].snippet.thumbnails.default.url + '"/><div style="margin-left:20px;"> <h3 id="title">' + data.items[0].snippet.title + '</h3> <h5 id="description" style="margin-top:-10px;">' + data.items[0].snippet.description.substring(0, 115) + '...</h5> <a href="#ex3" rel="modal:close"><button class="ui primary button" onclick="javascript:sendVideoId(\'' + id + '\');">공유</button></a> <a href="#ex3" rel="modal:close"><button class="ui button">닫기</button></a>';
            $('.resultsBox ul').html(html);
        });

    } else { //아니면 검색결과 팝업
        getList(query);
    }


}

function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

function exitroom() { 
    location.href='/';
}
