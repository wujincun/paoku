/**
 * Created by Administrator on 2016/11/16.
 */

var paoku ={
    w: $(window).width(),
    h: $(window).height(),
    bgDistance: 0,
    /* bgAdditionHeight: 0, //bgAddition是跑道附加素材
     bgAdditionDistance: 0,*/
    runner: {},
    frameCount: 0,
    /*swipeLock: true,*/
    totalDistance: 0,
    runwayLength: 0,
    bgSpeed: 0,
    baseSpeed: 0, //基础速度，bgSpeed在此基础上根据帧率发生变化
    blockList: [],
    /* runActTimer: '',
     startLineHeight: 0,
     scaleHeight: 0,
     scaleList: [],*/
    isInit: false,
    speedNormal: 0,
    speedFast: 0,
    speedSlow: 0,
    /* collisionTimer: '',
     endLine: {},*/
    rafId: '',
    lastTime: 0,
};
$.extend(true,paoku,{
    init: function() {
        var _this = this;
        //加载完图片后render
        var imgs = [
            './img/countdown_bg_1.png',
            './img/countdown_bg_2.png',
            './img/countdown_bg_3.png',
            './img/star_small.png',
            './img/new_bg.jpg',
            './img/runway_bg.jpg',
            './img/person_nm_1.png',
            './img/person_nm_2.png'
        ];
        var num = imgs.length;
        for(var i = 0;i<num;i++){
            var img = new Image();
            img.src = imgs[i];
            img.onload = function () {
                num--;
                if (num > 0) {
                    return;
                }
                _this.render()
            }

        }
        //设置初始值
        _this.totalDistance = _this.runwayLength = _this.w * 15; //跑道长度是宽度15倍
        _this.baseSpeed = _this.speedNormal = _this.bgSpeed = Math.round(_this.runwayLength / 1500); //25秒完成游戏，一秒60帧
        _this.speedFast = Math.round(_this.speedNormal * 7 / 4);
        _this.speedSlow = Math.round(_this.speedNormal / 4);
        //requestAnimationFrame兼容
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
                window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
    },
    render: function () {
        var _this = this;
        var w = this.w;
        var h = this.h;
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        //画场景
        _this.renderBg(ctx);
        _this.renderBlock(ctx);
        _this.renderRunner(ctx);

        if (!this.isInit) {
            this.renderListener(ctx);//3s开始倒计时
            this.isInit = true;
        }
    },
    renderBg:function (ctx) {
        //开始的背景 含起始线
        var _this = this;
        _this.bg = new Image();
        _this.bg.src = './img/new_bg.jpg';
        _this.bg.onload= function () {
            ctx.drawImage(_this.bg, 0, 0, _this.w, _this.h);
        };
        //背景，一直跑的跑道
        _this.bgAddition = new Image();
        _this.bgAddition.src = './img/runway_bg.jpg';
        _this.bgAdditionHeight = _this.w * 721 / 640;//按给的图的大小计算height，宽度整屏宽度
        _this.bgAdditionDistance = 0 - _this.bgAdditionHeight; //位置？？？

    },
    renderBlock:function (ctx) {

    },
    renderRunner:function(ctx){
        var _this = this;
        var w = this.w;
        var h = this.h;
        //按照图片尺寸设定人物宽高
        _this.runner.size = [w * 0.2, w * 0.2 * 190 / 130];
        _this.runner.centerPositon = (w - _this.runner.size[0]) / 2;
        _this.runner.positon = [_this.runner.centerPositon, h - _this.runner.size[1]];
        _this.runner.animateState = 1;

        var runnerImg = {
            normal: './img/person_nm_'
        };

        for (var key in runnerImg) {
            _this.runner[key] = new Object();
            for (var i = 1; i < 3; i++) {
                _this.runner[key][i] = new Image();
                _this.runner[key][i].src = runnerImg[key] + i + '.png';
            }
        }
        _this.runner.normal[1].onload = function () {
            ctx.drawImage(_this.runner.normal[1], _this.runner.positon[0], _this.runner.positon[1],_this.runner.size[0], _this.runner.size[1]);
        }
    },
    renderListener:function (ctx) {
        var _this = this;
        var readyCountNum = 3;
        var readyCountTimer = setInterval(function () {
            readyCountNum--;
            if (readyCountNum == 0) {
                clearInterval(readyCountTimer);
                $('#count_down').hide();
                _this.run(ctx); //跑
                _this.bind();
            } else {
                $('#count_down').attr('class', 'bg-' + readyCountNum);
            }
        }, 1000);
    },
    run:function (ctx) {
        var _this = this;
        function animateRun () {
            var curTime = Date.now();
            if (_this.lastTime > 0) {
                _this.bgSpeed = _this.baseSpeed * (60 * (curTime - _this.lastTime) / 1000);
            }
            _this.lastTime = curTime;

            //注意顺序，先画背景，再画终点线，再画刻度，再画障碍物，最后画人物
            ctx.clearRect(0, 0, _this.w, _this.h);

            _this.runBg(ctx);
            _this.frameCount++;
            _this.runRunner(ctx);

            if (_this.frameCount % 5 == 0) {
                _this.collisionTest();
            }
            _this.rafId = window.requestAnimationFrame(animateRun);
        }
        animateRun();
        //背景

        //人

        //

    },
    runBg:function (ctx) {
        var _this = this;
        //含起始线的背景移动
        _this.bgDistance += _this.bgSpeed;
        //ctx.drawImage(_this.bg, 0, 0, _this.w, _this.h);
        if (_this.bgDistance < _this.h) {
            ctx.drawImage(_this.bg, 0, _this.bgDistance, _this.w, _this.h);
        }
        //一直跑的跑道移动
        _this.bgAdditionDistance += _this.bgSpeed;
        for (var i = 0; i < 100; i++) {//i<100的循环？？随意定的
            ctx.drawImage(_this.bgAddition, 0, _this.bgAdditionDistance - i * _this.bgAdditionHeight, _this.w, _this.bgAdditionHeight);
            if (_this.bgAdditionDistance - i * _this.bgAdditionHeight <= 0) {
                break;
            }
        }
    },
    runRunner:function (ctx) {
        var _this = this;
        if (_this.frameCount % 10 == 0) {
            _this.runner.animateState == 1 ? _this.runner.animateState = 2 : _this.runner.animateState = 1;
        }
        ctx.drawImage(_this.runner.normal[_this.runner.animateState], _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0], _this.runner.size[1]);
    },
    runBlock:function (ctx) {

    },
    bind:function () {
        //count_time

        //swiperUp
    },
//碰撞检测
    collisionTest:function () {
        var _this = this;
        for (var i = 0; i < _this.blockList.length; i++) {
            if (_this.blockList[i] && _this.blockList[i].isShow) {
                var blockItem = _this.blockList[i],
                //小人中心点坐标
                    runnerHoriCenterCord = [_this.runner.positon[0] + _this.runner.size[0] / 2, _this.runner.positon[1] + _this.runner.size[1] / 2],
                //障碍物中心点坐标
                    blockHoriCenterCord = [blockItem.left + blockItem.width / 2, blockItem.top + blockItem.height / 2];

                if (Math.abs(runnerHoriCenterCord[0] - blockHoriCenterCord[0]) < (_this.runner.size[0] + blockItem.width) / 2 && Math.abs(runnerHoriCenterCord[1] - blockHoriCenterCord[1]) < (_this.runner.size[1] + blockItem.height) / 2) {
                    /*this.handleCollision(blockItem.type);
                     _this.blockList[i] = null;*/
                    //碰上就死掉的操作

                }
            }
        }
    },
    countTime:function () {

    }
});

paoku.init();