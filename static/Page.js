class Comment{
    constructor (userid, content, upload_time, likeCount, dislikeCount, sentiment, posting_id) {
        this.sentiment = sentiment;//댓글의 감정 상태
        this.userid = userid;//유저명
        this.content = content;//댓글 내용
        this.upload_time = upload_time;//댓글 업로드 시간
        this.likeCount = likeCount;//좋아요 수
        this.dislikeCount = dislikeCount;//싫어요 수
        this.posting_id = posting_id;//댓글이 저장되는 글의 아이디 (1번 글, 2번 글, 3번 글 .....)
    }
}// 댓글 정보 저장용 class

fetch('/increaseViewCount',{
    method: "POST",//POST로 보내기
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        "posting_id":new URL(location.href).searchParams.get('page_id')
    })
})
    .then(function (response) {
        return response.json();
    })

var textWatcherTimer = undefined;//타이머 저장용

var userCommentSentiment = true;//현재 입력중인 댓글의 감정(true => 긍정 false => 부정)

setTimeout(() => {
    const commentInput = document.getElementById('comment_input');//입력창의 내용 가져오기

    commentInput.oninput = function(e) {
        document.getElementById("submit").disabled = true;//분석 도중 서버로 댓글을 전송하는 걸 막기 위해 전송 버튼을 일시적으로 막음
        clearTimeout(textWatcherTimer);
        textWatcherTimer = setTimeout(() => {
            SentimentAnalysis(e.target.value);//만약, 0.25초 간 추가적인 입력이 없으면 감정을 분석
        }, 250)//0.25초 타이머 시작
    }
}, 500);/*
    작성 중인 댓글의 감정을 분석함

    작성 도중 0.25초 이상 멈추면
    서버로 전송해 분석함

    한 글자 타이핑 마다 감정을 분석하면 서버에 무리를 주기도 하고 속도가 느려지므로 타이머 사용

      글자 입력 <----------------------
         |                            |
    0.25초 시간 재기                   |
         |                            |
    타이머가 끝나기 전                 |
    입력이 들어왔나?  ----Yes----> 타이머 중지
         |
         |No
         |
    서버로 댓글 전송
*/

function SentimentAnalysis(comment){//입력 중인 댓글을 분석하기 위해 전송
    fetch('/sentimentAnalysis',{
        method: "POST",//POST 형식으로 전송
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "comment": comment//댓글 내용만을 전송
        })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (sentiment) {
            userCommentSentiment = sentiment["sentiment"];//분석된 감정을 받아 저장
            if(userCommentSentiment){
                document.getElementById("input_sentiment").src = "static/images/pos.png";//입력 창 옆 이모티콘을 감정에 따라 변경
            }else{
                document.getElementById("input_sentiment").src = "static/images/neg.png";//입력 창 옆 이모티콘을 감정에 따라 변경
            }
            
            document.getElementById("submit").disabled = false;//감정 분석이 끝났으므로 막아뒀던 전송 버튼 활성화
        })
}

function generateCommentHTML(comment){//Comment 클래스를 입력받아 댓글을 생성 (**복잡하므로 읽지 않아도 됨**)
    var newComment = document.createElement("div");
    newComment.className = "comment";

    var newSentiment = document.createElement("img");
    newSentiment.className = "sentiment_class";
    if(comment.sentiment){
        newSentiment.src = "static/images/positive.png";
    }
    else{
        newSentiment.src = "static/images/negative.png";
    }

    var newTxt = document.createElement("div");
    newTxt.className = "txt";

    var newContentTxt = document.createElement("div");
    newContentTxt.innerText = comment.content;

    var newInfo = document.createElement("div");
    newInfo.className = "info";
    newInfo.innerText = comment.userid;

    var newUploadTime = document.createElement("div");
    newUploadTime.className = "upload_time";
    newUploadTime.innerText = comment.upload_time;

    var newEmotionBtns = document.createElement("div");
    newEmotionBtns.className = "emotion_btns";

    var newLike = document.createElement("input");
    newLike.type = "button";
    newLike.value="Good | "+comment.likeCount;
    newLike.className = "like";

    var newDisike = document.createElement("input");
    newDisike.type = "button";
    newDisike.value="Bad | "+comment.dislikeCount;
    newDisike.className = "dislike";

    newComment.appendChild(newSentiment);

    newInfo.appendChild(newUploadTime);
    newTxt.appendChild(newInfo);

    newTxt.appendChild(newContentTxt);

    newComment.appendChild(newTxt);

    newEmotionBtns.appendChild(newLike);
    newEmotionBtns.appendChild(newDisike);

    newComment.appendChild(newEmotionBtns);

    let comments = document.getElementById("comments")
    comments.insertBefore(newComment, comments.childNodes[0]);
}//(**복잡하므로 읽지 않아도 됨**)

function getDate(date){//현재 시간을 YYYY-MM-DD HH:mm 형식으로 만들어 반환
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;

    return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}

function getComment(){//Submit 버튼 클릭시 댓글을 받아 서버로 전송 및 사용자에게 보여줌

    const content = document.getElementById("comment_input").value;//댓글 내용 받아오기

    if(content == ""){
        return;
    }

    const userid = "Anonymous";//유저명 (로그인 기능을 구현하지 않아 Anonymous로 고정함. 추후 변경 가능)

    const upload_time = getDate(new Date());//YYYY-MM-DD HH:mm 형식의 현재 시간

    const posting_id = new URL(location.href).searchParams.get('page_id');//현재 페이지 번호 얻기

    const comment = new Comment(//데이터들을 Comment 클래스로 모아 정리함
        userid,
        content,
        upload_time,
        0,
        0,
        userCommentSentiment,
        posting_id
    );

    sendComment(comment);//서버로 댓글 전송
    generateCommentHTML(comment);//화면에 댓글 띄우기

    document.getElementById("comment_input").value = "";//입력창 내용 초기화
}

function sendComment(comment){//DB에 저장하기 위해 서버로 댓글 전송하기
    fetch('/sendComment',{
        method: "POST",//POST로 보내기
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "comment":comment//댓글 클래스를 입력 받아 전송
        })
    })
        .then(function (response) {
            return response.json();
        })
}

setTimeout(() => {getComments()}, 100); //페이지 접속 0.5초 후 댓글 가져오기
function getComments(){
    fetch('/returnComments',{
        method: "POST",//POST로 보내기
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "page_id":new URL(location.href).searchParams.get('page_id') //페이지 번호 전달
        })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (comments) {
            comments.forEach(function(comment){ //전달 받은 댓글들을 하나씩 화면에 보여줌
                const commentClass = new Comment(
                    comment[1],
                    comment[2],
                    comment[3],
                    comment[4],
                    comment[5],
                    comment[6],
                    comment[7],
                );

                generateCommentHTML(commentClass);
            })
        })    
}

function changeLikes(commentID, likeType){
    fetch('/changeLikes',{
        method: "POST",//POST로 보내기
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "commentID":commentID,
            "likeType":likeType
        })
    })
        .then(function (response) {
            return response.json();
        })
}