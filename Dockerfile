FROM nginx

ADD etc/nginx.conf /etc/nginx/nginx.conf
ADD src /var/www
