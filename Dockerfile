FROM python:3.9-alpine

# 设置工作目录
WORKDIR /app

# 复制 requirements.txt 并安装依赖
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY ./app /app
RUN mkdir /app/db

ENV ACCESS_PASSWORD=""
ENV SECRET_KEY=""
ENV MAX_SHARE_TIME=4320
ENV REQUEST_LIMIT=24
ENV TIME_WINDOW=60
ENV CLEANUP_INTERVAL_MINUTES=30
ENV PENALTY_DURATION=5
ENV MAX_CACHE_SIZE=1000

# 检查并创建 coolshare.db 文件
RUN test -f /app/db/coolshare.db || touch /app/db/coolshare.db

# 暴露 Flask 应用端口
EXPOSE 5000

# 设置启动命令
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"] 
