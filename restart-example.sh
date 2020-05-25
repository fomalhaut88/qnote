docker stop qnote-app
docker rm qnote-app
docker build -t qnote .
docker run -it -p 8080:8080 --restart=always --name qnote-app -d qnote
