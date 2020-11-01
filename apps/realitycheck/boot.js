(function() {
  let state = require("Storage").readJSON("realitycheck.json", true);
  const currentTime = (new Date()).getTime();
  let timeout;

  //Log events during testing
  function testingLogger(msg) {
    let log = require("Storage").open('realitycheck.log', 'a');
    log.write(`${msg} - ${new Date().toString()}` + '\n');
  }

  function handleAccel(acc, state) {
    if (acc.diff > 0.4 && !state.sleepCycleInProgress) {
      console.log('Sleep cycle started.');
      testingLogger('Sleep cycle started.');

      //Update state & disable 'accel' listener to save battery life
      state.sleepCycleInProgress = true;
      Bangle.removeListener('accel', handleAccel);

      //REM sleep usually start an hour and a half after waking up during the night
      state.nextTimeout = (new Date()).getTime() + (60000 * 90);
      state.handler = "handleREM";
      require("Storage").write("realitycheck.json", JSON.stringify(state));
      return setTimeout(() => {
        load("realitycheck.js");
      }, state.nextTimeout - (new Date()).getTime());
    } else {
      return;
    }
  }

  //Create realitycheck.json on install
  if (!state) {
    const _state = {
      awake: true,
      nextTimeout: currentTime + (60000 * 90), //Set the first timeout to happen in an hour and a half for simplicity's sake
      changed: false,
      sleepCycleInProgress: false,
      buzzCounter: 0
    }
    require("Storage").write("realitycheck.json", JSON.stringify(_state));
    state = _state;
  }

  //Check if we are in the sleep loop
  if (state.handler === "handleSleepLoop") {
    console.log('Sleep loop started.');
    testingLogger('Sleep loop started.');

    //Start litening to accelerometer
    Bangle.on('accel', (acc) => handleAccel(acc, state));
    return;
  }

  //Check if nextTimeout is set
  if (state.nextTimeout) {
    timeout = state.nextTimeout - currentTime;
    if (timeout < 100) timeout = 100;
  } else {
    timeout = 100;
  }

  Bangle.removeListener('accel', handleAccel);

  return setTimeout(() => { //Load as per schedule
    load("realitycheck.js");
  }, timeout);
})();
