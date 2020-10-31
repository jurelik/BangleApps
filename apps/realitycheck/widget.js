(() => {
  let doubleTapLocked = false;
  let state = require("Storage").readJSON("realitycheck.json", true);

  //Draw widget
  function draw() {
    g.reset();
    if (state.awake) {
     g.drawImage(atob('GBgCAAAAAAAAAAAAAAAAAAADwAAAAAADwAAAAPADwA8AAPwAAD8AAD8//PwAAA////AAAAP//8AAAA/wD/AAAA/AA/AAD8/AA/PwD8/AA/PwAA/AA/AAAA/wD/AAAAP//8AAAA////AAAD8//PwAAPwAAD8AAPADwA8AAAADwAAAAAADwAAAAAAAAAAAAAAAAAAA'), this.x, this.y);
    } else {
     g.drawImage(atob('GBgCAAAAAAAAAAAAAAAAAAP//8AAAA////AAAP/z//8AAP8A//8AA/AADz/AD/AAD//wD8AAA//wD8AAAD/wDwAAA//wDwAAA//wDwAAADzwDwAAA//wD8AAA//wD8AADz/wD/AAD//wA/AAA//AAP8AD/8AAP/w//8AAA////AAAAP//8AAAAAAAAAAAAAAAAAA'), this.x, this.y);
    }
  }

  function changeAwake(btn) {
    //Handle double tap
    if (!btn.lastTime || btn.time - btn.lastTime > 1 || doubleTapLocked) {
      return;
    }

    state.awake = !state.awake;
    state.changed = true;
    state.nextTimeout = undefined;
    state.sleepCycleInProgress = false;
    state.buzzCounter = 0;

    if (!state.awake) {
      state.handler = 'handleAsleep';
    } else {
      state.handler = undefined;
    }

    //Block double tap for  2 seconds after changing state to prevent bad UX
    doubleTapLocked = true;
    setTimeout(function() {
      doubleTapLocked = false;
    }, 2000);

    require("Storage").write("realitycheck.json", state);
    load("realitycheck.js");
  }

  //Add button listener
  setWatch(changeAwake, BTN1, {repeat: true});

  WIDGETS["realitycheck"]={
    area: 'tl',
    width: 24,
    draw: draw,
  };
})();
