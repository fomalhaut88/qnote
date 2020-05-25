docker stop qnote-app
docker build -t qnote .
docker run -it -p 8080:8080 --rm --name qnote-app -d qnote
