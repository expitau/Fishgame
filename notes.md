# Project notes
### Game
[ ] Squares go bash
    [ ] Squares collide with each other
[x] Map generation
[ ] Fall off map
[ ] Map tiles fall gradually
[ ] Points
[ ] Powerups

### Error Log
[x] Whenever a player leave or they restart their tab, then a player charactor is left in it's original position and a new player charactor is created.
[x] Players only update when their tab is active, so if a tab is minimized or closed, the player is entirely still
[x] Player speed is dependent on the number of requests the browser makes per second, meaning lower rate browsers and slow internet speeds effect play speed movement.

### Optimizations and potential changes
[ ] Every tick the entire tilemap is sent to every player (bleh)