(function() {

  //厳格モード
  'use strict';


  /*WebAudioAPIを使うための設定*/


  //AudioContextクラスのコンストラクタを呼び出して、
  //AudioContextクラスのインスタンスを生成。これが処理の起点
  //これをすることにより、Web Audio APIが定義するプロパティやメソッドにアクセス可能。
  // ベンダープレフィックスが現状のブラウザの実装には必要
  //Firefoxではプレフィックスなし、Operaではプレフィックスに対応
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();


  /*音源ノード生成（audio要素からオーディオデータ取得）*/


  //audio要素を取得
  var audioSrc = document.getElementById("audio-element");
  // audio要素を音源とするMediaElementAudioSourceNodeを生成
  var audio = context.createMediaElementSource(audioSrc);

  var audioSrc2 = document.getElementById("audio-element2");
  var audio2 = context.createMediaElementSource(audioSrc2);


  /*ゲイン*/


  //中間処理（音量調整処理）を表すAudioNodeが持つAudioParamに
  //input要素の値を代入。表示にも値を反映する
  var elementGain = document.getElementById('gain');
  var elementGainValue = document.getElementById('gain-value');
  var gain = context.createGain();
  var setGain = function() {
    gain.gain.value = elementGainValue.innerText = elementGain.value;
  };
  setGain();


  /*フィルター（ローパス＆ハイパス*/


  var elementBiquadFilterType = document.getElementById('biquad-filter-type');
  var elementBiquadFilterFrequency = document.getElementById('biquad-filter-frequency');
  var elementBiquadFilterFrequencyValue = document.getElementById('biquad-filter-frequency-value');
  var elementBiquadFilterFrequencyContainer = document.getElementById('biquad-filter-frequency-container');
  var biquadFilter = context.createBiquadFilter();
  var setBiquadFilterType = function() {
    //biquadFilterTypeを選び、textに代入
    var text = elementBiquadFilterType.options[elementBiquadFilterType.selectedIndex].text;
    //gainノード、biquadFilterノード、共にすべての接続を一度切断
    gain.disconnect();
    biquadFilter.disconnect();
    //BiquadFilterNodeがオフの場合 textがoff
    if (text === 'off') {
      //id="biquad-filter-frequency-container"にis-hidden追加
      elementBiquadFilterFrequencyContainer.classList.add('is-hidden');
      //GainNode → Destination
      gain.connect(context.destination);
      //BiquadFilterがローパスフィルターかハイパスフィルターの場合
    } else {
      //id="biquad-filter-frequency-container"からis-hiddenを取り除く
      elementBiquadFilterFrequencyContainer.classList.remove('is-hidden');
      //BiquadFilterTypeを選び、BiquadFilter.typeに代入
      biquadFilter.type = elementBiquadFilterType.options[elementBiquadFilterType.selectedIndex].text;
      //GainNode → BiquadFilterNode → Destination
      gain.connect(biquadFilter);
      biquadFilter.connect(context.destination);
    }
  };
  var setBiquadFilterFrequency = function() {
    //〜Hzか表示
    biquadFilter.frequency.value = elementBiquadFilterFrequencyValue.innerText = elementBiquadFilterFrequency.value;
  };
  setBiquadFilterFrequency();

  //なにも選ばないときはこれ。
  //音源ノード → GainNode
  audio.connect(gain);
  audio2.connect(gain);
  //Gainノード -> 音声出力ノード
  gain.connect(context.destination);


  /*音源を解析*/


  var analyser = context.createAnalyser();
  //解析対象の音声データを格納するための型付き配列を準備(Uint8Array:符号なし8bit整数の配列)
  //引数(配列の要素数)にはAnalyserNodeオブジェクトのfrequencyBinCountプロパティを設定する
  var frequencies = new Uint8Array(analyser.frequencyBinCount);
  //音量として、解析結果の全周波数の振幅の平均を計算する
  var getByteFrequencyDataAverage = function() {
    //配列に周波数ごとの振幅を格納
    analyser.getByteFrequencyData(frequencies);
    //解析結果の全周波数の振幅を合計し要素数で割ることで平均を求める
    return frequencies.reduce(function(previous, current) {
      return previous + current;
    }) / analyser.frequencyBinCount;
  };


  /*マイク取得*/


  //音声のみ取得する場合は引数を{audio: true}に設定する
  //返り値はPromiseオブジェクト
  navigator.mediaDevices.getUserMedia({audio: true})
    // 成功ハンドラが引数としてMediaStreamオブジェクトを受け取る
    .then(function(stream) {
      // Firefoxには、グローバルに保持しておかないと
      // MediaStreamオブジェクトへの参照が時間経過でなくなってしまうバグがあるため、対策しておく
      window.hackForMozzila = stream;
      // MediaStreamAudioSourceNodeを生成
      // 引数にはMediaStreamオブジェクトが必要 アナライザーに接続
      context.createMediaStreamSource(stream).connect(analyser);
    });


  /*マイクの音量表示*/


  var drawVolume;
  var elementVolume = document.getElementById('volume');
  //可能な限り高いフレームレートで音量を取得し、表示を更新する
  (drawVolume = function() {
    elementVolume.innerHTML = Math.floor(getByteFrequencyDataAverage());
    requestAnimationFrame(drawVolume);
  })();


  /*画像をマイクの音量に応じてSVG不透明に*/


  var drawImg;
  var elementImg = document.getElementById('prfmMagicOfLove');
  //可能な限り高いフレームレートで音量を取得し、表示を更新する
  (drawImg = function() {
    //opacityの範囲である0〜1に変換
    elementImg.style.opacity = getByteFrequencyDataAverage() / 64;
    requestAnimationFrame(drawImg);
  })();


  /*DOMへのイベント登録*/


  var elementButton = document.getElementById('button');
  var isPlaying;
  var changeMusicButton = document.getElementById('change');
  //再生＆停止ボタン
  elementButton.addEventListener('click', function() {
    //最初は再生されていない、押すと再生
    audioSrc[!isPlaying ? 'play' : 'pause']();
    isPlaying = !isPlaying;
  });
  //音量調節
  elementGain.addEventListener('mouseup', setGain);
  //フィルター選ぶ、数値選ぶやつ表示
  elementBiquadFilterType.addEventListener('change', setBiquadFilterType);
  elementBiquadFilterFrequency.addEventListener('mouseup', setBiquadFilterFrequency);


  /*MIDIの設定*/


  //初期化
  var midi = new poormidi();
  //MIDIを受ける
  midi.setHandler(onMIDIEvent);

  function onMIDIEvent(e) {
    var message = e.data[0] & 0xf0;
    if (message === 0x90) { //Note On
      //処理
      console.log('aaa');
      (function() {
        audioSrc[!isPlaying ? 'play' : 'pause']();
        isPlaying = !isPlaying;
      })();
    }
    console.log(message);
    //NoteNumber 40, Velocity 127
    // midi.sendNoteOn(40, 127);
    // midi.sendNoteOff(40);
    // midi.sendCtlChange(40, 10);
  }




  /*three.jsのビジュアライズ*/


  //three.jsの描画
  //シーン（3D表現をする空間）の作成
  var scene = new THREE.Scene();

  //カメラ（シーン内で表示する場所を決める）の作成
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  //レンダラー（用意したシーン、メッシュを表示させる命令）を作る
  // var renderer = new THREE.WebGLRenderer();
  //レンダラーサイズを設定
  var renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor( '#000000', 0.1);


  //レンダラーをbodyに設定
  // document.body.appendChild(renderer.domElement);

  var canvasThree = document.getElementById('canvasZone');
  var canvasThreeWidth;
  var canvasThreeHeight;
  //canvasをWindowサイズに
  canvasThree.width = canvasThreeWidth = window.innerWidth;
  canvasThree.height = canvasThreeHeight = window.innerHeight;
  canvasThree.appendChild(renderer.domElement);

  //ジオメトリー（座標やメッシュ（3Dオブジェクト）の形）
  //3Dオブジェクトの形と大きさを設定 キューブで1cm四方
  var geometry = new THREE.CubeGeometry(1, 1, 1);

  // var geometryUpdate;
  // var geometry;
  // (geometryUpdate = function() {
  //   geometry = new THREE.CubeGeometry(1, 1, 1);
  //   requestAnimationFrame(geometryUpdate);
  //
  //   console.log(getByteFrequencyDataAverage());
  // })();

  //マテリアル（表面素材やメッシュの色）
  //3Dオブジェクトの素材と色を設定
  var material = new THREE.MeshBasicMaterial( {color: '#ffffff', wireframe: true} );
  //3Dオブジェクトを作成
  var cube_1 = new THREE.Mesh(geometry, material);
  cube_1.position.x = 0;
  var cube_2 = new THREE.Mesh(geometry, material);
  cube_2.position.x = -2;
  var cube_3 = new THREE.Mesh(geometry, material);
  cube_3.position.x = 2;
  var cube_4 = new THREE.Mesh(geometry, material);
  cube_4.position.y = 1.5;
  var cube_5 = new THREE.Mesh(geometry, material);
  cube_5.position.y = -1.5;
  // var cubeUpdate;
  // var cube;
  // (cubeUpdate = function() {
  //   cube = new THREE.Mesh(geometry, material);
  //   requestAnimationFrame(cubeUpdate);
  // })();

  //作成された3Dオブジェクトをシーン（scene）に適応
  scene.add(cube_1);
  scene.add(cube_2);
  scene.add(cube_3);
  scene.add(cube_4);
  scene.add(cube_5);
  // var sceneUpdate;
  // (sceneUpdate = function() {
  //   scene.add(cube);
  //   requestAnimationFrame(sceneUpdate);
  // })();


  //表示する祭のカメラの角度の設定
  // camera.position.z = 5;
  //シーンをレンダリング
  // var frame = 0;
  function render() {
    var rotationX = 0.1;
    var rotationY = 0.1;
    requestAnimationFrame(render);
    cube_1.rotation.x += rotationX;
    cube_1.rotation.y += rotationY;
    cube_2.rotation.x += rotationX;
    cube_2.rotation.y += rotationY;
    cube_3.rotation.x += rotationX;
    cube_3.rotation.y += rotationY;
    cube_4.rotation.x += rotationX;
    cube_4.rotation.y += rotationY;
    cube_5.rotation.x += rotationX;
    cube_5.rotation.y += rotationY;
    // cube.rotation.z += 0.1;
    // frame++;
    // if (frame % 2 == 0) {return;}
    renderer.render(scene, camera);
  }
  render();


})();
