
 var socket = io();
 var username = $("#name").val();
 var message = $("#message").val();

 var sharedId;


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

     $("#send-url").click(() => {
         var key = "qr3dLL=bbqSfX--Q";
         var username = $("#name").val();
         var url = $("#urlInput").val();

         if (!username && !url) {
             alert('URL을 입력해주세요.');
         } else if (!username && url) {
             alert('닉네임이 설정되어 있지 않습니다.');
         } else if (username && !url) {
             alert('URL을 입력해주세요.');
         } else if (username && url) {
             console.log('Sending message from client');
             sendMessage({
                 name: username,
                 message: "[shareUrl,"+key+"]"+url
             });
         }

         $("#urlInput").val('');

     })
 })
 socket.on('message', addMessages)


 function addMessages(message) {
     var username = $("#name").val();
     var adpater = JSON.stringify(message).toString();
     
     if(adpater.indexOf('[shareUrl,qr3dLL=bbqSfX--Q]') != -1) {
         var urlmsg = message.message.toString().replace("[shareUrl,qr3dLL=bbqSfX--Q]", "");
         $("#messages").append(`<a href="#ex2" onclick="javascript:getDataById('`+urlmsg+`');" rel="modal:open"><div class="infoMessage"><h4 style="background-color: rgba(104, 125, 153, 0.5);padding:10px 15px;border-radius:20px;">${message.name}님이 영상을 공유했습니다<br>여기를 눌러 확인하세요 ></h4></div></a>`);
         sharedId = urlmsg;
         
     }
     else if(message.name==username) {
         $("#messages").append(`<div class="msgBox me"><h4 class="bubble_username"> ${message.name} </h4> <p class="bubble_message"> ${message.message} </p></div>`)

     } else {
         $("#messages").append(`<div class="msgBox others"><h4 class="bubble_username"> ${message.name} </h4> <p class="bubble_message"> ${message.message} </p></div>`)

     }

     $('#messages').scrollTop($('.chatForm')[0].scrollHeight);



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
    player.isMuted() ? player.unMute() : player.mute()
}


function playVideo(id) {
    player.loadVideoById(id);
    getDataById_forPlay(id);
}

function getDataById(id) {
    videoId = id.toString();

    if(sharedId == videoId) {
        var ytApiKey = "AIzaSyAEcxLMHrlz_Kkd2pPIMVd6kow01FFBE8E"; 

$.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + ytApiKey, function(data) {
  var title = data.items[0].snippet.title;
  var description = data.items[0].snippet.description.substring(0, 115)+"...";
  var thumnail = data.items[0].snippet.thumbnails.standard.url;
  $("#error").html('');

  $("#title").html(title);
  $("#description").html(description);
  $("#thumnail").attr("src", thumnail); 
});
    } else {
        $("#error").html('만료된 공유입니다. 최근 공유 영상을 재생하려면 아래 버튼을 누르세요.');

        $("#title").html('');
  $("#description").html('');
  $("#thumnail").attr("src", ''); 
    }
    
}

function getDataById_forPlay(id) {
    videoId = id.toString();
    var ytApiKey = "AIzaSyAEcxLMHrlz_Kkd2pPIMVd6kow01FFBE8E"; 

$.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + ytApiKey, function(data) {
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
        left: getPercent+'%'
    }, animationLength);
    
}, 1000);




