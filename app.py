from flask import Flask, request, render_template, jsonify
import random
import sqlite3

def insertComment(data):#DB에 댓글 삽입
    with sqlite3.connect("WEB.db") as connection:
        cursor = connection.cursor()
        cursor.execute("INSERT INTO comments (userid, content, upload_time, like, dislike, sentiment, posting_id) \
        VALUES(?, ?, ?, ?, ?, ?, ?)", data)
        connection.commit()

def getPosting(id):#DB에서 페이지 내용 가져오기 (페이지 내용은 미리 저장되어 있어야 함. 작성 불가)
    with sqlite3.connect("WEB.db") as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM postings WHERE id=?", (id))
        posting = cursor.fetchone()
        return posting

def getCommentsByPostingId(positng_id):#페이지 번호로 DB에서 댓글 가져오기(각 페이지에 저장된 댓글을 가져오는 것)
    with sqlite3.connect("WEB.db") as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM comments WHERE posting_id=?", (positng_id))
        comments = cursor.fetchall()
        return comments

def analyzeSentiment(comment):#모델로 분석 후 값을 반환
    return bool(random.choice([True, False]))#모델이 없어 랜덤값 반환

def getPagesFromBehind(startID, pageAmount):
    with sqlite3.connect("WEB.db") as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT id, title, SUBSTR(content, 0, 500), upload_time, view_count FROM postings ORDER BY id DESC LIMIT ?, ?", (startID, pageAmount))
        posting = cursor.fetchall()
        return posting

def updateViewCount(positng_id):#페이지 번호로 DB에서 댓글 가져오기(각 페이지에 저장된 댓글을 가져오는 것)
    with sqlite3.connect("WEB.db") as connection:
        cursor = connection.cursor()
        cursor.execute("UPDATE postings SET view_count = view_count+1 WHERE id=?", (positng_id))
        connection.commit()

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('Home.html')

@app.route('/page')
def topicPage():
    page_id = request.args.get('page_id')#페이지 번호 받기

    posting = getPosting(page_id)#페이지 번호로 페이지 내용 가져오기

    if posting is None:
        return "없는 페이지 입니다."

    title = posting[1]
    content = posting[2]
    upload_time = posting[3]

    return render_template('Page.html', title=title, content=content, upload_time=upload_time)#페이지 반환

@app.route('/sendComment', methods=['GET', 'POST'])
def sendComment():
    if request.method == 'GET':
        return 200
    if request.method == 'POST':#POST 접근만 허용

        requestedJson = request.get_json()
        comment = requestedJson["comment"]#댓글 데이터 받기

        data = (
            comment["userid"],
            comment["content"],
            comment["upload_time"],
            comment["likeCount"],
            comment["dislikeCount"],
            comment["sentiment"],
            comment["posting_id"],
        )#데이터 형식 변환

        insertComment(data)#DB에 댓글 삽입

        return jsonify(200)

@app.route('/sentimentAnalysis', methods=['GET', 'POST'])
def sentimentAnalysis():
    if request.method == 'GET':
        return 200
    if request.method == 'POST':#POST 접근만 허용
        requestedJson = request.get_json()

        comment = requestedJson["comment"]
        sentiment = analyzeSentiment(comment)#댓글 받아서 감정 분석

        response = {"sentiment":sentiment}

        return jsonify(response)#값 전송


@app.route('/returnComments', methods=['GET', 'POST'])
def returnComments():
    if request.method == 'GET':
        return 200
    if request.method == 'POST':#POST 접근만 허용
        requestedJson = request.get_json()

        page_id = requestedJson["page_id"]#전달 받은 페이지 번호 가져오기

        comments = getCommentsByPostingId(page_id)#해당 페이지에 등록된 댓글 모두 가져오기

        return jsonify(comments)#값 전송

@app.route('/returnPages', methods=['GET', 'POST'])
def returnPages():
    if request.method == 'GET':
        return 200
    if request.method == 'POST':#POST 접근만 허용
        requestedJson = request.get_json()

        startID = requestedJson["startID"]
        pageAmount = requestedJson["pageAmount"]

        postings = getPagesFromBehind(startID, pageAmount)

        return jsonify(postings)#값 전송

@app.route('/increaseViewCount', methods=['GET', 'POST'])
def increaseViewCount():
    if request.method == 'GET':
        return 200
    if request.method == 'POST':#POST 접근만 허용
        requestedJson = request.get_json()

        posting_id = requestedJson["posting_id"]

        updateViewCount(posting_id)

        return jsonify()

if __name__ == "__main__":
    app.run()