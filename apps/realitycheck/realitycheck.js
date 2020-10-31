clearTimeout();

function main() {
  let state = require("Storage").readJSON("realitycheck.json", true);

  //Dont buzz if we are just entering sleep state
  if (state.handler === "handleSleepStart") {
    state.handler = "handleSleepLoop";
    require("Storage").write("realitycheck.json", JSON.stringify(state));
    return setTimeout(() => { //Load() doesn't work without the timeout for some reason.
      load();
    }, 100);
  }

  //Handle first loop after double tap & display message
  if (state.changed) {
    state.changed = false;
    if (state.awake) {
      testingLogger("User activated awake state.");
      g.reset();
      g.drawImage(require("heatshrink").decompress(atob("mEwwIdagOAApMD4AFJC5U4AQMcAQM8ARUcg/gCgUAj/4EYd//wFD/EfFwfgg4wCgPAgYFCAYIHBAo8HAQPgAo0P44FB8fwAosDCIYeBDoovLIIpNFLIplGOIh9FR5ahFZcYAWA==")), g.getWidth()/2 - 24, g.getHeight()/2 - 24);
    } else {
      g.reset();
      g.drawImage(require("heatshrink").decompress(atob("mEwwIdah/wAof//4ECgYFB4AFBg/z5/gAoMfwOH/AFBnw8B/gFBvgFB/wFBBwMw74FBFoMGj8AgIgBAoOAgYsBg0b4EDwAUB4fAg4FD8EHIgQFFjAFGhwFDuAFD4YFF+ALJC4oFLDoJBJAokGI4RZBg0Z8BlCAoJrBTwRrBPoUA44PBAoXPR4yhCgyqBVoUGBAK5BwExXIUH+E/EATRFborpGACo")), g.getWidth()/2 - 24, g.getHeight()/2 - 24);
    }
  } else {
    g.reset();
    g.drawImage(require("heatshrink").decompress(atob("mEwwI1yj/4Aof//4ECgYFB4AFBh4FB+AWC+EPDAU/wEB/gFB/wCBv8ABAcfBwPwg/gh+AgfgGoMH4ABBn/8BIINBv/+CoIFBvk+AoMfgH4AQUegAOBgF4nwFDCgIFECIodFFIo1FIIpNFLIplFOIp9GRIqVFUIqtFXIwAtA=")), g.getWidth()/2 - 24, g.getHeight()/2 - 24);
  }

  handleBuzz().then(() => {
    testingLogger("Buzz.");
    if (state.awake) {
      //Schedule a buzz at a random point between 1.5 and 2 hours.
      const rand = Math.random() * ((60000 * 120) - (60000 * 90)) + (60000 * 90);
      state.nextTimeout = (new Date()).getTime() + rand;
      require("Storage").write("realitycheck.json", JSON.stringify(state));
    } else {
      switch (state.handler) {
        case "handleAsleep":
          handleAsleep(state);
          break;
        case "handleREM":
          handleREM(state);
          break;
        default:
          break;
      }
      require("Storage").write("realitycheck.json", JSON.stringify(state));
    }
    setTimeout(() => {
      load();
    }, 2000);
  });
}

//Asleep handler
function handleAsleep(state) {
  testingLogger('User activated asleep state.');
  console.log('User activated asleep state.');

  //Wait an hour and a half before starting to listen for movement
  state.nextTimeout = (new Date()).getTime() + (60000 * 90);
  state.handler = "handleSleepStart";
}

//REM sleep handler
function handleREM(state) {
  console.log('REM buzz.');
  testingLogger('REM buzz.');
  //Buzz every 5 minutes for half an hour
  if (state.buzzCounter > 5) {
    state.buzzCounter = 0;
    state.sleepCycleInProgress = false;
    state.handler = "handleSleepLoop";
    return;
  }

  state.buzzCounter++;
  state.nextTimeout = (new Date()).getTime() + (60000 * 5);
}

//Log events during testing
function testingLogger(msg) {
  let log = require("Storage").open('realitycheck.log', 'a');
  log.write(`${msg} - ${new Date().toString()}` + '\n');
}

//Watch buzz handler
function handleBuzz() {
  return new Promise((resolve) => {
    Bangle.buzz(50, 1)
      .then(() => new Promise(_resolve => setTimeout(_resolve,150)))
      .then(() => Bangle.buzz(50, 1))
      .then(() => new Promise(_resolve => setTimeout(_resolve,150)))
      .then(() => Bangle.buzz(50, 1))
      .then(resolve)
      .catch(err => resolve());
  });
}

main();
