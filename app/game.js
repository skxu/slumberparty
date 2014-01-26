
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
var muteBGM = false;
var muteSFX = false;
var gameOver = false;
var rematch_player = false;
var rematch_opponent = false;



var opponentWave = '';
var opponentZzz = '';
window.addEventListener("load",function() {
  var myDiv = document.getElementById("console"); //has to use document.getElementById
  
  var divWidth = myDiv.offsetWidth;
  var divHeight = myDiv.offsetHeight;

  var canvas = $("#game");
  canvas.prop({width: divWidth, height:divHeight});
  canvas.imageSmoothingEnabled = false;
  canvas.webkitImageSmoothingEnabled = false;

  $(window).resize(function() {
  var myDiv = document.getElementById("console"); //has to use document.getElementById
  var divWidth = myDiv.offsetWidth;
  var divHeight = myDiv.offsetHeight;

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



var slumberGame = new Firebase('https://slumberparty.firebaseIO.com/game');
var slumberReadyRef = new Firebase('https://slumberparty.firebaseIO.com/ready');


slumberReadyRef.on('child_added', function(snapshot) {
  var contents = snapshot.val();
  globalMessage = contents.name + " is now ready";
  if (contents.UUID != UUID) {
    opponentReady = true;
  } else {
    playerReady = true;
  }
});



slumberUsersRef.on('child_removed', function(snapshot) {
  var userName = snapshot.name();
  var contents = snapshot.val();
  gameStarted = false;
  opponentConnected = false;
  opponentReady = false;
  Q.audio.stop();
  //console.log(contents.name + " has left");
  globalMessage = contents.name + " has left the game";

});

slumberUsersRef.on('child_added', function(snapshot) {
  var contents = snapshot.val();
  console.log(contents.name + " AAAAAAAAA");
  if (contents === null) {
    opponentConnected = false;
    opponentName = 'noOpponent';
  } else if (!gameStarted && contents.UUID != UUID) {
    opponentConnected = true;
    opponentName = contents.name;
    globalMessage = contents.name + " has joined the game";
  } 
});

slumberGame.on('value', function(snapshot){
  var contents = snapshot.val();
  if (contents !== null && contents.UUID != UUID) {
    if (contents.miss && opponentHP >= 0) {
      //play miss
      opponentZzz.p.play = true;
      opponentZzz.p.frame = 0;
      opponentHP = contents.hp
    } else if (contents.hit) {
      //play hit
      opponentWave.p.angle = - 120 - (Math.random() * 40);
      opponentWave.p.play = true;
      opponentWave.p.frame = 0;
    }
  }
});

//slumberDataRef.push({'name': 'Sam', 'message' : UUID});

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
      cy: 20,
    });
    this.add("animation");

  },

  step: function(dt) {
    if (gameStarted && !gameOver) {
      if (this.p.swingspeed < 2) {
        this.p.swingspeed = 2;
      }
      this.p.swingspeed += 0.002;
    } else {
      this.p.swingspeed = 0;
      this.p.angle = 0;
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


Q.UI.Container.extend("Bubble", {
  init: function(p) {
    this._super(p, {
      fill: "white",
      border: 2,
      insideText: 0,
      height_margin: 5,
      width_margin: 5,
      x: 0,
      y: -60,
    });
  }
});

Q.UI.Text.extend("Announcer", {
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
      this.calcSize();
      this.p.bubble.fit(2,5);
    }
    if (playerHP <= 0 && opponentHP <= 0 && !gameOver) {
      globalMessage = "TIE?!";
      this.p.label = globalMessage;
      this.calcSize();
      this.p.bubble.fit(2,5);
      gameOver = true;
      opponentReady = false;
      readyCon.remove();
      Q.stage().insert(new Q.UI.Button ({
        label: "REMATCH",
        fill: "#FFFFFF",
        y: Q.height - 300,
        x: Q.width/2,
        border: 5,
      }, function() {
        opponentHP = "50"
        playerHP = "50"
        gameOver = false;
        gameStarted = false;
        playerReady = true;
        rematch_player = true;
        rematch_opponent = true;

        readyCon = slumberReadyRef.push({"name":playerName, "UUID":UUID, "ready":true});
        readyCon.onDisconnect().remove();
        this.destroy();
      }));
    } else if (playerHP <= 0 && opponentHP > 0 && !gameOver) {
      globalMessage = opponentName +  " wins the match!";
      this.p.label = globalMessage;
      this.calcSize();
      this.p.bubble.fit(2,5);
      gameOver = true;
      opponentReady = false;
      readyCon.remove();
      Q.stage().insert(new Q.UI.Button ({
        label: "REMATCH",
        fill: "#FFFFFF",
        y: Q.height - 300,
        x: Q.width/2,
        border: 5,
      }, function() {
        opponentHP = "50"
        playerHP = "50"
        gameOver = false;
        gameStarted = false;
        playerReady = true;
        rematch_player = true;
        rematch_opponent = true;

        readyCon = slumberReadyRef.push({"name":playerName, "UUID":UUID, "ready":true});
        readyCon.onDisconnect().remove();
        this.destroy();
      }));
    } else if (playerHP > 0 && opponentHP <= 0 && !gameOver) {
      globalMessage = playerName +  " wins the match!";
      this.p.label = globalMessage;
      this.calcSize();
      this.p.bubble.fit(2,5);
      gameOver = true;
      readyCon.remove();
      Q.stage().insert(new Q.UI.Button ({
        label: "REMATCH",
        fill: "#FFFFFF",
        y: Q.height - 300,
        x: Q.width/2,
        border: 5,
      }, function() {
        opponentHP = "50"
        playerHP = "50"
        gameOver = false;
        gameStarted = false;
        playerReady = true;
        rematch_player = true;
        rematch_opponent = true;

        readyCon = slumberReadyRef.push({"name":playerName, "UUID":UUID, "ready":true});
        readyCon.onDisconnect().remove();
        this.destroy();
      }));
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
    if (this.p.frame == 6 && playerReady && opponentReady && !gameStarted && !gameOver) {
      countingDown = true;
      this.p.frame = 5;
      this.play('countdown');
    } else if (this.p.frame != 6 && playerReady && opponentReady && !gameStarted && !gameOver) {
      this.play('countdown');
    }

    if (countingDown && !gameStarted && this.p.frame == 0) {
      gameStarted = true;
      if (!muteBGM) {
        Q.audio.play('bgm.mp3', {loop: true});
      }
      console.log('GAME STARTED');
    }
  }
});

Q.UI.Text.extend("PlayerName", {
  init: function(p) {
    this._super(p, {
      label: "Player One",
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
      this.p.label = playerName.toString();

      console.log('updated name to ' + playerName);
    }
  }
});

Q.UI.Text.extend("OpponentName", {
  init: function(p) {
    this._super(p, {
      label: "Waiting for Opponenet",
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
    this.hide();
  },
  step: function(dt) {
    if (this.p.label != opponentHP) {
      this.p.label = opponentHP;
      var element = document.getElementById("opponentHPBar");
      element.style.width = Math.floor((opponentHP/100)*100) + "%";
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
    this.hide();
  },
  step: function(dt) {
    if (this.p.label != playerHP) {
      this.p.label = playerHP;
      var element = document.getElementById("playerHPBar");
      element.style.width = Math.floor((playerHP/100)*100) + "%";
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
      if (this.p.frame == 7 && Q.inputs['fire'] && possibleHit && !missed && gameStarted && !gameOver) {
        targetHit = true;
        hitFlag = true;
        this.p.frame = 0;
        var hp = parseInt(playerHP);
        playerHP = (hp + 1).toString();
        if (!muteSFX) {
          Q.audio.play('wave.mp3');
        }
        slumberGame.update({"UUID":UUID, "miss":false, "hit":true, "hp":playerHP});
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
      if (autoMiss && playerHP >= 0) {
        this.p.frame = 0;
        if (!muteSFX) {
          Q.audio.play('snore.mp3');
        }
        autoMiss = false;
        var hp = parseInt(playerHP);
        hp -= 4;
        playerHP = hp.toString();
        slumberGame.update({"UUID":UUID, "miss":true, "hit":false, "hp":playerHP});
      }
      if (this.p.frame == 1 && Q.inputs['fire'] && !possibleHit && !targetHit && playerHP >= 0) {
        missed = true;
        this.p.frame = 0;
        if (!muteSFX) {
          Q.audio.play('snore.mp3', {debounce:300});
        }
        var hp = parseInt(playerHP);
        hp -= 1;
        playerHP = hp.toString();
        slumberGame.update({"UUID":UUID, "miss":true, "hit":false, "hp":playerHP});

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
      spinoff: 1,
      dead: false,
    });
  this.add('animation');
  },

  step: function(dt) {
    var framerate = 1;
    if (this.p.y > 1500 || this.p.spinoff < -50 || this.p.spinoff > 50) {
      //this.hide();
      console.log("^_^");
    }
    if (this.p.player) {
      if (rematch_player) {
        this.p.dead = false;
        this.p.x = Q.width/4;
        this.p.y = 3*Q.height/4;
        this.p.vx = 0;
        this.p.vy = 0;
        this.p.ay = 0;
        this.p.ax = 0;
        this.p.angle = 0;
        this.p.gravity = 0;
        rematch_player = false;
      }
      framerate = Math.max(parseInt(playerHP)/400, 1/25);
      if (playerHP <= 0) {
        
        if (!this.p.dead) {
          this.add('2d');
          this.p.rand = 10*Math.random();
          this.p.dead = true;
        }
        if (this.p.rand > 5) {
          this.p.spinoff += 0.05
          this.p.angle -= this.p.spinoff;
          
          this.p.vx = -20;
          this.p.ay = -10;
        } else {
          this.p.angle = -140;
          this.p.ay = -30;
        }
      }

      
    } else {
      if (rematch_opponent) {
        this.p.dead = false;
        this.p.x = 3*Q.width/4;
        this.p.y = 3*Q.height/4;
        this.p.vx = 0;
        this.p.vy = 0;
        this.p.ay = 0;
        this.p.ax = 0;
        this.p.angle = 0;
        this.p.gravity = 0;
        rematch_opponent = false;
      }
      framerate = Math.max(opponentHP/400, 1/50);
      if (opponentHP <= 0) {
        this.p.angle = -140;
        this.add('2d');
        this.p.ay = -40;
      }
    }
    if (framerate != 1/50) {
      Q.animations("drowzee", {
        left: { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50], loop: true, rate: framerate, flip: false},
        right: { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50], loop: true, rate: framerate, flip: "x"}
      });
    }
    if (this.p.direction == "left") {
      this.play("left");
    } else {
      this.play("right");
    }
  }

});



Q.scene("level1",function(stage) {

  //stage.insert(new Q.Bar({x:Q.width/2 , y:Q.height/2}));
  stage.insert(new Q.Pendulum({x:Q.width/2 , y:Q.height/8}));
  var container = stage.insert(new Q.UI.Container({
      hidden: false,
      fill: "gray",
      border: 5,
      shadow: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      y: 50,
      x: Q.width/2 
    }));
  var announcerBubble = stage.insert(new Q.UI.Container({x:Q.width/2, y:40, fill:"white", border: 2, width_margin: 5, height_margin: 20}));
  stage.insert(new Q.Announcer({bubble:announcerBubble, color:"black"}), announcerBubble);

  var player = stage.insert(new Q.Drowzee({direction:"right", x:Q.width/4, y:3*Q.height/4}));
  stage.insert(new Q.Wave({angle: 120 + (Math.random() * 40), direction: "right", x:player.p.x + 70, y:player.p.y - 40, frame:7, drowzee:player}));
  stage.insert(new Q.Zzz({frame: 1, x:player.p.x + 180, y:player.p.y - 100, drowzee:player}));


  var opponent = stage.insert(new Q.Drowzee({player:false, direction:"left", x:3*Q.width/4, y:3*Q.height/4}));
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



  stage.insert(new Q.UI.Button({
    sheet:'audio',
    x:Q.width - 40,
    y:Q.height - 40
  }, function() {
    if (!muteSFX) {
      this.p.frame = 0;
      muteSFX = true;
      muteBGM = true;
      Q.audio.stop();
    } else if (muteSFX) {
      this.p.frame = 1;
      muteSFX = false;
      muteBGM = false;
      //Q.audio.play('bgm.mp3');
    }
  }));

});


Q.loadTMX("level1.tmx", function() {
  Q.load("audio.png, audio.json, snore.mp3, wave.mp3, bgm.mp3, countdown.png, countdown.json, zzz.png, zzz.json, wave.png, wave.json, drowzee.png, drowzee.json, pendulum.png, pendulum.json, bar.json, bar.png",function() {
    Q.compileSheets("player.png","player.json");
    Q.compileSheets("bar.png", "bar.json");
    Q.compileSheets("pendulum.png", "pendulum.json");
    Q.compileSheets("drowzee.png", "drowzee.json");
    Q.compileSheets("wave.png", "wave.json");
    Q.compileSheets("zzz.png", "zzz.json");
    Q.compileSheets("countdown.png", "countdown.json");
    Q.compileSheets("audio.png", "audio.json");
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
