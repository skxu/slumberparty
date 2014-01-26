
var globalMessage = '';
var opponentConnected = false;
var opponentName = '';
var playerReady = false;
var opponentReady = false;
var gameStarted = false;
var opponentHP = "50";
var playerHP = "50";
var countingDown = false;
var possibleHit = false;
var targetHit = false;
var autoMiss = false;
var missed = false;
var hitFlag = true;
var readyCon = '';

var opponentWave = '';
var opponentZzz = '';
window.addEventListener("load",function() {
  var myDiv = document.getElementById("console"); //has to use document.getElementById
  
  var divWidth = myDiv.offsetWidth;
  var divHeight = myDiv.offsetHeight - 84;

  var canvas = $("#game");
  canvas.prop({width: divWidth, height:divHeight});
  canvas.imageSmoothingEnabled = false;
  canvas.webkitImageSmoothingEnabled = false;

  $(window).resize(function() {
    var myDiv = document.getElementById("console"); //has to use document.getElementById
  if (debug) {
    console.log("divID: console, width = " + myDiv.offsetWidth);
  }
  var divWidth = myDiv.offsetWidth;
  var divHeight = myDiv.offsetHeight - 84;

  var canvas = document.getElementById("#game"); //has to use document.getElementById
  if(canvas && canvas[0] && canvas[0].getContext('2d')) {
    ctx = canvas[0].getContext('2d');
    ctx.canvas.height = divHeight;
    ctx.canvas.width = divWidth;
    console.log(divHeight);
    console.log(divWidth);
    Q.width = divWidth;
    Q.height = divHeight;
    Q.cssWidth = divWidth;
    Q.cssHeight = divHeight;
  }
});



var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        .setup("game", {

        })
        .controls().touch().enableSound();

function goHTML5Audio() {
    Q.assets = {};
    Q.audio.enableHTML5Sound();
    loadAssetsAndGo();
  }

  function goWebAudio() {
    Q.assets = [];
    Q.audio.enableWebAudioSound();
    loadAssetsAndGo();
  }

var UUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});

var slumberGame = new Firebase('https://slumberparty.firebaseIO.com/game');
var slumberReadyRef = new Firebase('https://slumberparty.firebaseIO.com/ready');


slumberReadyRef.on('child_added', function(snapshot) {
  var contents = snapshot.val();
  globalMessage = "user: " + contents.name + " is now ready";
  if (contents.UUID != UUID) {
    opponentReady = true;
  } else {
    playerReady = true;
  }
});

var slumberUsersRef = new Firebase('https://slumberparty.firebaseIO.com/users');
slumberUsersRef.on('child_added', function(snapshot) {
  var contents = snapshot.val();
  //var message = snapshot.message();
  console.log("We have a new user: " + contents.name);
  globalMessage = "user UUID: " + contents.name + " has joined the game";
});

slumberUsersRef.on('child_removed', function(snapshot) {
  var userName = snapshot.name();
  var contents = snapshot.val();
  console.log(contents.name + " has left");
  globalMessage = "user UUID: " + contents.name + " has left the game";

});

slumberUsersRef.on('child_added', function(snapshot) {
  var contents = snapshot.val();
  if (contents === null) {
    opponentConnected = false;
    opponentName = 'noOpponent';
  } else if (gameStarted == false && contents.UUID != UUID) {
    opponentConnected = true;
    opponentName = contents.name;
  } else {
    opponentConnected = false;
    opponentName = 'Waiting for Opponent';
  }
});

slumberGame.on('value', function(snapshot){
  var contents = snapshot.val();
  if (contents !== null && contents.UUID != UUID) {
    if (contents.miss) {
      //play miss
      opponentZzz.p.play = true;
      opponentZzz.p.frame = 0;
      var hp = parseInt(opponentHP);
      opponentHP = (hp - 1).toString();
    } else if (contents.hit) {
      //play hit
      opponentWave.p.angle = - 120 - (Math.random() * 40);
      opponentWave.p.play = true;
      opponentWave.p.frame = 0;
    }
  }
});

//slumberDataRef.push({'name': 'Sam', 'message' : UUID});
var con = slumberUsersRef.push({'name': playerName, 'UUID': UUID});
con.onDisconnect().remove();
//slumberDataRef.update({'test': UUID});



Q.Sprite.extend("Bar", {

  init: function(p) {

    this._super(p, {
      sheet: "bar",
      sprite: "bar",
    });


  }



});

Q.Sprite.extend("Pendulum", {

  init: function(p) {

    this._super(p, {
      sheet: "pendulum",
      sprite: "pendulum",
      clockwise: false,
      swingspeed: 2,
      maxswingspeed: 15,
      cy: 0,
    });
    this.add("animation");

  },

  step: function(dt) {
    if (gameStarted) {
      if (this.p.swingspeed < 2) {
        this.p.swingspeed = 2;
      }
      this.p.swingspeed += 0.001;
    } else {
      this.p.swingspeed = 0;
    }
    if (this.p.swingspeed > this.p.maxswingspeed) {
      this.p.swingspeed = 2;
    }
    if (this.p.angle < 15 && this.p.angle > -15) {
      possibleHit = true;
      this.play("target");
    } else {
      this.play("normal");
      possibleHit = false;
    }
    if (this.p.angle < 70 && this.p.clockwise) {
      this.p.angle += this.p.swingspeed; 
    } else if (this.p.angle >= 70 && this.p.clockwise) {
      this.p.clockwise = false;
      this.p.angle -= this.p.swingspeed;
      if (!hitFlag) {
        autoMiss = true;
      } else {
        hitFlag = false;
      }
    } else if (this.p.angle > -70 && !this.p.clockwise) {
      this.p.angle -= this.p.swingspeed;
    } else if (this.p.angle <= -70 && !this.p.clockwise) {
      this.p.clockwise = true;
      this.p.angle += this.p.swingspeed;
      if (!hitFlag) {
        autoMiss = true;
      } else {
        hitFlag = false;
      }
    }
  }

});


Q.UI.Text.extend("Annoucer", {
  init: function(p) {
    this._super(p, {
      label: "Welcome",
      size: 15,
      color: "white",
      family: "Tahoma",
      bubble: 0,
      x: 0,
      y: 0
    });
  },
  step: function(dx) {
    if (this.p.label != globalMessage) {
      this.p.label = globalMessage;
    }
  }
});


Q.Sprite.extend("Countdown", {
  init: function(p) {
    this._super(p, {
      sheet:"countdown",
      sprite:"countdown",
      x:Q.width/2,
      y:3*Q.height/4
    });
    this.add('animation');
  },
  step: function(dt) {
    if (this.p.frame == 6 && playerReady && opponentReady && !gameStarted) {
      countingDown = true;
      this.p.frame = 5;
      this.play('countdown');
    } else if (this.p.frame != 6 && playerReady && opponentReady && !gameStarted) {
      this.play('countdown');
    }

    if (countingDown && !gameStarted && this.p.frame == 5) {
      gameStarted = true;
      Q.audio.play('bgm.mp3', {loop: true});
      console.log('GAME STARTED');
    }
  }
});

Q.UI.Text.extend("PlayerName", {
  init: function(p) {
    this._super(p, {
      label: playerName,
      size: 20,
      color: "white",
      family: "Tahoma",
      bubble: 0,
      x: 0,
      y: 0
    });

  },
  step: function(dt) {
    if (this.p.label != playerName) {
      this.p.label = playerName;
    }
  }
});

Q.UI.Text.extend("OpponentName", {
  init: function(p) {
    this._super(p, {
      label: opponentName,
      size: 20,
      color: "white",
      family: "Tahoma",
      bubble: 0,
      x: 0,
      y: 0
    });

  },
  step: function(dt) {
    if (this.p.label != opponentName) {
      this.p.label = opponentName;
    }
  }
});



Q.UI.Text.extend("OpponentHP", {
  init: function(p) {
    this._super(p, {
      label: opponentHP,
      size: 25,
      color: "white",
      family: "Tahoma",
      bubble: 0,
      x: 0,
      y: 0
    });
  },
  step: function(dt) {
    if (this.p.label != opponentHP) {
      this.p.label = opponentHP;
    }
  }
});

Q.UI.Text.extend("PlayerHP", {
  init: function(p) {
    this._super(p, {
      label: playerHP,
      size: 25,
      color: "white",
      family: "Tahoma",
      bubble: 0,
      x: 0,
      y: 0
    });
  },
  step: function(dt) {
    if (this.p.label != playerHP) {
      this.p.label = playerHP;
    }
  }
});


Q.Sprite.extend("Wave", {
  init: function(p) {
    this._super(p, {
      cx: 0,
      sheet: "wave",
      sprite: "wave",
      direction: "left",
      drowzee: "",
      play: false,

    });
    this.add('animation');
  },

  step: function(dt) {
    if (this.p.drowzee.p.player) {
      if (this.p.frame == 7 && Q.inputs['fire'] && possibleHit && !missed) {
        targetHit = true;
        hitFlag = true;
        this.p.frame = 0;
        Q.audio.play('wave.mp3');
        slumberGame.update({"UUID":UUID, "miss":false, "hit":true});
        if (this.p.direction == "left") {
          this.p.angle = -120 - (Math.random() * 40);
        } else {
          this.p.angle = 120 + (Math.random() * 40);
        }
      } else if (this.p.direction == "left" && this.p.frame != 7) {
        this.play('left');
      } else if (this.p.direction == "right" && this.p.frame != 7) {
        this.play('right');
      } else if (this.p.frame == 7) {
        targetHit = false;
      }
    } else {
      opponentWave = this;
      if (this.p.play && this.p.frame == 7) {
        this.p.play = false;
      } else if (this.p.play) {
        if (this.p.direction == "left") {
          this.play('left');
        } else if (this.p.direction == "right") {
          this.play('right');
        }
      }
    }
  }
});


Q.Sprite.extend("Zzz", {
  init: function(p) {
    this._super(p, {
      sheet: "zzz",
      sprite: "zzz",
      direction: "left",
      drowzee:'',

    });
    this.add('animation');
  },

  step: function(dt) {
    if (this.p.drowzee.p.player) {
      if (autoMiss) {
        this.p.frame = 0;
        Q.audio.play('snore.mp3');
        autoMiss = false;
        var hp = parseInt(playerHP);
        hp -= 1;
        playerHP = hp.toString();
        slumberGame.update({"UUID":UUID, "miss":true, "hit":false});
      }
      if (this.p.frame == 1 && Q.inputs['fire'] && !possibleHit && !targetHit) {
        missed = true;
        this.p.frame = 0;
        Q.audio.play('snore.mp3', {debounce:300});
        var hp = parseInt(playerHP);
        hp -= 1;
        playerHP = hp.toString();
        slumberGame.update({"UUID":UUID, "miss":true, "hit":false});

      } else if (this.p.frame == 0 && this.p.direction == "left") {
        this.play('left');
      } else if (this.p.frame == 0 && this.p.direction == "right") {
        this.play('right');
      } else if (this.p.frame == 1) {
        missed = false;
      }
    } else {
      opponentZzz = this;
      if (this.p.play && this.p.frame == 1) {
        this.p.play = false;
      } else if (this.p.play) {
        if (this.p.direction == "left") {
          this.play('left');
        } else if (this.p.direction == "right") {
          this.play('right');
        }
      }
    }
  }
});

Q.Sprite.extend("Drowzee", {
  init: function(p) {
    this._super(p, {
      sheet: "drowzee",
      sprite: "drowzee",
      direction: "left",
      player: true,
    });
  this.add('animation');
  },

  step: function(dt) {
    if (this.p.direction == "left") {
      this.play("left");
    } else {
      this.play("right");
    }
  }

});



Q.scene("level1",function(stage) {

  stage.insert(new Q.Bar({x:Q.width/2 + 10, y:Q.height/2}));
  stage.insert(new Q.Pendulum({x:Q.width/2 + 10, y:Q.height/8}));
  stage.insert(new Q.Annoucer({x:Q.width/2 + 10, y:20}));
  var player = stage.insert(new Q.Drowzee({direction:"right", x:Q.width/4 + 10, y:3*Q.height/4}));
  stage.insert(new Q.Wave({angle: 120 + (Math.random() * 40), direction: "right", x:player.p.x + 70, y:player.p.y - 40, frame:7, drowzee:player}));
  stage.insert(new Q.Zzz({frame: 1, x:player.p.x + 180, y:player.p.y - 100, drowzee:player}));


  var opponent = stage.insert(new Q.Drowzee({player:false, direction:"left", x:3*Q.width/4 - 10, y:3*Q.height/4}));
  stage.insert(new Q.Wave({angle: 120 + (Math.random() * 40), direction: "left", x:opponent.p.x - 70, y:opponent.p.y - 40, frame:7, drowzee:opponent}));
  stage.insert(new Q.Zzz({direction:"right", frame: 1, x:opponent.p.x - 180, y:opponent.p.y - 100, drowzee:opponent}));

  stage.insert(new Q.PlayerName({x:100, y:20}));
  stage.insert(new Q.OpponentName({x:Q.width - 200, y:20}));

  stage.insert(new Q.PlayerHP({x:40, y:Q.height/3}));
  stage.insert(new Q.OpponentHP({x:Q.width - 40, y:Q.height/3}));

  stage.insert(new Q.Countdown({frame: 6, x:Q.width/2, y:3*Q.height/4}));

  stage.insert(new Q.UI.Button({
      label: "READY",
      fill: "#FFFFFF",
      y: Q.height - 150,
      x: Q.width/2,
      border: 5,
    }, function() {
      this.hide();
      readyCon = slumberReadyRef.push({"name":playerName, "UUID":UUID, "ready":true});
      readyCon.onDisconnect().remove();
    }));
});


Q.loadTMX("level1.tmx", function() {
  Q.load("snore.mp3, wave.mp3, bgm.mp3, countdown.png, countdown.json, zzz.png, zzz.json, wave.png, wave.json, drowzee.png, drowzee.json, pendulum.png, pendulum.json, bar.json, bar.png",function() {
    Q.compileSheets("player.png","player.json");
    Q.compileSheets("bar.png", "bar.json");
    Q.compileSheets("pendulum.png", "pendulum.json");
    Q.compileSheets("drowzee.png", "drowzee.json");
    Q.compileSheets("wave.png", "wave.json");
    Q.compileSheets("zzz.png", "zzz.json");
    Q.compileSheets("countdown.png", "countdown.json");
    Q.animations("countdown", {
      countdown : {frames:[4,3,2,1,0,5], rate: 1, flip: false, loop: false },
    })
    Q.animations("pendulum", {
      normal : {frames: [0]},
      target : {frames: [1]}
    });
    Q.animations("drowzee", {
      left: { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50], loop: true, rate: 1/4, flip: false},
      right: { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50], loop: true, rate: 1/4, flip: "x"}
    });
    Q.animations("wave", {
      left: { frames: [0,1,2,3,4,5,6,7], rate: 1/21, flip: false, loop: false },
      right: { frames: [0,1,2,3,4,5,6,7], rate: 1/21, flip: "x", loop: false }
    });
    Q.animations("zzz", {
      left: { frames: [0,1], rate: 1/2, flip: false, loop: false },
      right: { frames: [0,1], rate: 1/2, flip: "x", loop: false}
    });
    Q.stageScene("level1");
  });
});


});
