# Fish Game
Developed collaboratively by [@Reumarks](https://github.com/reumarks) and [@Expitau](https://github.com/expitau-dev)

## Usage

### Server Setup (Docker)
The fastest way to set up a fishgame server is using [Docker](https://www.docker.com/get-started/). 
1. Ensure the docker daemon is started
2. Set `.env` to the correct interface (the public ip address that clients will connect to) 
3. Run `docker compose up` in the project root directory. 

This will start both a webserver and the fishgame websocket server. The fishgame server (ws_backend) will output a room code, which clients can enter to connect to it. Note that if the client is connecting over https, the server *must* also be running on https. 

### Client Setup
To connect, navigate to the ip address of the webserver (the ip set in `.env`) on port 8080. For example, if the server was running on `192.168.1.1`, navigate the client to `http://192.168.1.1:8080`. It will prompt you for the room code that was output by the server in the previous section. Clients can connect from any browser, and mobile devices are supported.

### Server Setup (Baremetal)
If you do not wish to set up the server with docker, you can alternatively run the backend on the host machine. Navigate to the `backend` folder of the project, and run `npm install && npm start {INTERFACE}`, where `{INTERFACE}` is the public ip address of the server. This will NOT start a webserver, you will need to serve the frontend directory yourself either via nginx, apache, or other server of your choice. The webserver does not need to be on the same machine as the fishgame server, so long as clients are able to connect to port 3000 on the fishgame server's ip. 
