# Requires openssl
cd ssl
openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
    -subj "/C=CA/ST=ON/L=Waterloo/O=/CN=" \
    -keyout server.key  -out server.cert