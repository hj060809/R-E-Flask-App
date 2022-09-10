class Page{
    constructor(id, title, content, upload_time, viewCount){
        this.id = id;
        this.title = title;
        this.content = content;
        this.upload_time = upload_time;
        this.viewCount = viewCount;
    }
}

function generatePageHTML(page){
    var newPage = document.createElement("div");
    newPage.className = "page";

    var newTitle = document.createElement("div");
    newTitle.className = "title";
    newTitle.innerText = page.title;

    var newContent = document.createElement("div");
    newContent.className = "content";
    newContent.innerText = page.content;

    var newViewCount = document.createElement("div");
    newViewCount.className = "viewCount";
    newViewCount.innerText = page.viewCount;

    newPage.appendChild(newTitle);
    newPage.appendChild(newContent);
    newPage.appendChild(newViewCount);
    
    newPage.addEventListener("click", (e)=>{
        window.location.href = "/page?page_id="+page.id;
    })

    let pages = document.getElementById("pages")
    pages.appendChild(newPage);
}

setTimeout(() => {getPages(0, 50)}, 100); //페이지 접속 0.5초 후 댓글 가져오기
function getPages(startID, pageAmount){
    fetch('/returnPages',{
        method: "POST",//POST로 보내기
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "startID":startID,
            "pageAmount":pageAmount,
        })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (pages) {
            pages.forEach(function(pages){ //전달 받은 댓글들을 하나씩 화면에 보여줌
                const pageClass = new Page(
                    pages[0],
                    pages[1],
                    pages[2].replaceAll("\n", " "),
                    pages[3],
                    pages[4],
                );

                generatePageHTML(pageClass);
            })
        })   
}