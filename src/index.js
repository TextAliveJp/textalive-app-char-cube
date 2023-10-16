import * as THREE from "three";
import { Player } from "textalive-app-api";

/**
 * 
 * 3Dライブラリ「three.js」を使用したシンプルなデモ
 * 
 */
class Main
{
    constructor ()
    {
        var threeMng = new ThreeManager();
        this._threeMng = threeMng;

        this._initPlayer();
        
        window.addEventListener("resize", () => this._resize());
        this._update();
    }
    // プレイヤー初期化
    _initPlayer ()
    {
        var player = new Player({
            app: {
                // トークンは https://developer.textalive.jp/profile で取得したものを使う
                token: "rR1JoTmnx0KeK0Wn",
                parameters: [
                    {
                        title: "テキスト色",
                        name: "Color",
                        className: "Color",
                        initialValue: "#000000"
                    },
                    {
                        title: "背景色",
                        name: "BackgroundColor",
                        className: "Color",
                        initialValue: "#EEEEEE"
                    },
                ],
            },
            mediaElement: document.querySelector("#media")
        });
        
        player.addListener({
            onAppReady: (app) => this._onAppReady(app),
            onVideoReady: (v) => this._onVideoReady(v),
            onTimeUpdate: (pos) => this._onTimeUpdate(pos),
            onAppParameterUpdate: (name, value) => this._onAppParameterUpdate(name, value)
        });
        this._player = player;
    }
    // アプリ準備完了
    _onAppReady (app)
    {
        if (! app.songUrl)
        {
            // 真島ゆろ / 嘘も本当も君だから
            this._player.createFromSongUrl("https://piapro.jp/t/YW_d/20210206123357", {
                video: {
                    // 音楽地図訂正履歴: https://songle.jp/songs/2121405/history
                    beatId: 3953908,
                    repetitiveSegmentId: 2099661,
                    // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FYW_d%2F20210206123357
                    lyricId: 52061,
                    lyricDiffId: 5123,
                },
            });
        }

        // 画面クリックで再生／一時停止
        document.getElementById("view").addEventListener("click", () => function(p){ 
            if (p.isPlaying) p.requestPause();
            else             p.requestPlay();
        }(this._player));
    }
    // ビデオ準備完了
    _onVideoReady (v)
    {
        // 歌詞のセットアップ
        var lyrics = [];
        if (v.firstChar)
        {
            var c = v.firstChar;
            while (c)
            {
                lyrics.push(new Lyric(c));
                c = c.next;
            }
        }
        this._threeMng.setLyrics(lyrics);
    }
    // 再生位置アップデート
    _onTimeUpdate (position)
    {
        this._position   = position;
        this._updateTime = Date.now();

        this._threeMng.update(position);
    }
    // パラメタアップデート
    _onAppParameterUpdate (name, value)
    {
        var  col = value.r * 256 * 256 + value.g * 256 + value.b;
        switch (name)
        {
        case "Color":
            this._threeMng.changeColor(col);
            break;
        case "BackgroundColor":
            this._threeMng.changeBackgroundColor(col);
            break;
        }
    }

    _update ()
    {
        if (this._player.isPlaying && 0 <= this._updateTime && 0 <= this._position)
        {
            var t = (Date.now() - this._updateTime) + this._position;
            this._threeMng.update(t);
        }
        window.requestAnimationFrame(() => this._update());
    }
    _resize ()
    {
        this._threeMng.resize();
    }
}

class Lyric
{
    constructor (data)
    {
        this.text      = data.text;      // 歌詞文字
        this.startTime = data.startTime; // 開始タイム [ms]
        this.endTime   = data.endTime;   // 終了タイム [ms]
        this.duration  = data.duration;  // 開始から終了迄の時間 [ms]

        if (data.next && data.next.startTime - this.endTime < 500) this.endTime = data.next.startTime;
        else this.endTime += 500;
    }
}

class ThreeManager
{
    constructor ()
    {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;

        //
        // THREE.js (Renderer, Scene, Camera) の初期化
        //        
        var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(w, h);
        document.getElementById("view").appendChild(renderer.domElement);

        var col   = 0xeeeeee;
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(col);

        var camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
        camera.position.z = 20;
        camera.lookAt(0, 0, 0);

        this._renderer = renderer;
        this._scene    = scene;
        this._camera   = camera;

        this._color = "#000";

        // 歌詞表示用ボックスの生成
        this._can = document.createElement("canvas");
        this._ctx = this._can.getContext("2d");
        var tex = this._tex = new THREE.Texture(this._can);
        var mat = this._mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
        var box = this._box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), mat);
        scene.add(box);     
        
        this._drawFrame();
    }

    // 色の変更（外枠＆文字）
    changeColor (color)
    {
        var col = color.toString(16);
        for (var i = col.length; i < 6; i ++) col = "0" + col;
        this._color = "#" + col;
        
        this._drawFrame();
    }
    // 背景色の変更
    changeBackgroundColor (color)
    {
        this._scene.background.set(color);
    }
    // 歌詞の更新
    setLyrics (lyrics)
    {
        this._lyrics = lyrics;
    }

    // 再生位置アップデート
    update (position)
    {
        this._position = position;
        if (! this._lyrics) return;

        // 外枠を残してキャンバスをクリア
        this._ctx.clearRect(8, 8, this._can.width - 16, this._can.height - 16);
        var tk = "";

        for (var i = 0, l = this._lyrics.length; i < l; i ++)
        {
            var lyric = this._lyrics[i];
            // 開始タイム < 再生位置 && 再生位置 < 終了タイム
            if (lyric.startTime <= position && position < lyric.endTime)
            {
                // 歌詞の描画
                var progress = this._easeOutBack(Math.min((position - lyric.startTime) / Math.min(lyric.endTime - lyric.startTime, 200), 1));
                tk = lyric.text + progress;
                if (this._tk != tk) this._drawText(lyric.text, progress);
                break;
            }
        }
        // テクスチャの更新
        if (this._tk != tk) this._tex.needsUpdate = true;
        this._tk = tk;

        // ボックスの回転
        this._box.rotation.set(position / 1234, position / 2345, position / 3456);

        this._renderer.render(this._scene, this._camera);
    }
    // リサイズ
    resize ()
    {
        var stw = this._stw = document.documentElement.clientWidth;
        var sth = this._sth = document.documentElement.clientHeight;
        
        this._camera.aspect = stw / sth;
        this._camera.updateProjectionMatrix();
        
        this._renderer.setSize(stw, sth);
    }
    
    // 外枠（ワイヤーフレーム）の描画
    _drawFrame ()
    {
        var can = this._can;
        var ctx = this._ctx;

        can.width = can.height = 512;

        ctx.strokeStyle = this._color;
        ctx.lineWidth = 8;
        ctx.rect(0, 0, can.width, can.height);
        ctx.stroke();
        this._tex.needsUpdate = true;
    }
    // 文字の描画
    _drawText (text, progress)
    {
        var can = this._can;
        var ctx = this._ctx;

        var size = can.width;
        var fontSize = size * 0.5 * progress;
        ctx.textAlign = "center";
        ctx.fillStyle = this._color;
        ctx.font = "bold " + fontSize + "px sans-serif";

        ctx.fillText(text, size/2, size/2 + fontSize * 0.37);
    }
    _easeOutBack (x) { return 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2); }
}

new Main()