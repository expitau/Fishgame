let env = {
    "server": "http://localhost:3000"
}

// Comment out if server doesn't change
env.server = "http://" + prompt("Enter server IP : port", "localhost:3000")