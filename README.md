# Trout Bout

Trout Bout is a chaotic fast-paced physics based fish-fighting game!
This game's server is entirely Peer-To-Peer, which means that there is no setup reuired to instantly host servers and play online
with your friends. It can be played with as many players as the host's internet connection and device can support.

<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/22671898/260339595-45259d5f-fb82-4aae-b746-d2c99bf5cd9a.png" alt="drawing" width="300"/>


## Hosting a Game

Create a new game by going to [expitau.github.io/Fishgame](https://expitau.github.io/Fishgame) and clicking `HOST`.

Others can join by going to the [expitau.github.io/Fishgame](https://expitau.github.io/Fishgame) and typing in the 
"Room Code" found in the Host's settings menu and clicking `JOIN`, or by scanning the QR code provided, to join the game.

## How to play

This game can be played on any device, but was designed primarily with touchscreen in mind.

To move, press/click down on your mouse, then drag in any direction to aim your fish's "slap".
When the slap is over a wall or other slappable object then releasing it will slap that
surface and send you flying in the opposite direction.

You can slap any other surfaces you pass in order to change your direction, and slap your
opponents in order to gain points and send them flying.

## Setup Repo Locally

- Clone the resposity to your computer
- Open the repo in VScode
- Make sure [pnpm is installed](https://pnpm.io/installation) on your machine
- Run `pnpm install` in the root folder of the repo
- Run `pnpm run start` to start a web-server
