import sqlite3
from tkinter import N

connection = sqlite3.connect("WEB.db")
cursor = connection.cursor()

title = "자연어 처리"

content = "자연어 처리(自然語處理) 또는 자연 언어 처리(自然言語處理)는 인간의 언어 현상을 컴퓨터와 같은 기계를 이용해서 묘사할 수 있도록 연구하고 이를 구현하는 인공지능의 주요 분야 중 하나다.\n\
    자연 언어 처리는 연구 대상이 언어 이기 때문에 당연하게도 언어 자체를 연구하는 언어학과 언어 현상의 내적 기재를 탐구하는 언어 인지 과학과 연관이 깊다.\n\
    구현을 위해 수학적 통계적 도구를 많이 활용하며 특히 기계학습 도구를 많이 사용하는 대표적인 분야이다.\n\
    정보검색, QA 시스템, 문서 자동 분류, 신문기사 클러스터링, 대화형 Agent 등 다양한 응용이 이루어지고 있다."

upload_time = "2022-09-10 23:04"

cursor.execute("INSERT INTO postings (title, content, upload_time) \
    VALUES(?, ?, ?)", (title, content, upload_time))
connection.commit()

connection.close()