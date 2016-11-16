/**
 * Created by Administrator on 2016/11/16.
 */
var paoku ={
    intCons : {
        w: $(window).width(),
        h: $(window).height(),
        bgDistance: 0,
        /* bgAdditionHeight: 0, //bgAddition是跑道附加素材
         bgAdditionDistance: 0,*/
        runner: {},
        /* frameCount: 0,
         swipeLock: true,*/
        totalDistance: 0,
        runwayLength: 0,
        bgSpeed: 0,
        baseSpeed: 0, //基础速度，bgSpeed在此基础上根据帧率发生变化
        /*blockList: [],
         runActTimer: '',
         startLineHeight: 0,
         scaleHeight: 0,
         scaleList: [],*/
        isInit: false,
        speedNormal: 0,
        speedFast: 0,
        speedSlow: 0,
        /* collisionTimer: '',
         endLine: {},
         rafId: '',*/
        lastTime: 0,
    },
    init: function() {
        var _this = this;
        //加载完图片???
        var imgs = [
            './img/countdown_bg_1.png',
            './img/countdown_bg_2.png',
            './img/countdown_bg_3.png',
            './img/star_small.png',
            './img/new_bg.jpg',
            './img/person_nm_1.png',
            './img/person_nm_2.png'
        ];
        for(var i = 0;i<imgs.length;i++){
            var num = imgs.length;
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
        /* this.intCons.totalDistance = this.intCons.runwayLength = w * 15; //跑道长度是宽度15倍
         this.intCons.baseSpeed = this.intCons.speedNormal = this.intCons.bgSpeed = Math.round(this.intCons.runwayLength / 1500); //25秒完成游戏，一秒60帧
         this.speedFast = Math.round(this.speedNormal * 7 / 4);
         this.speedSlow = Math.round(this.speedNormal / 4);*/

    },
    render: function () {
        var _this = this;
        var w = this.intCons.w;
        var h = this.intCons.h;
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
        var _this = this;
        var bg = new Image();
        bg.src = './img/new_bg.jpg';
        bg.onload= function () {
            ctx.drawImage(bg, 0, 0, _this.intCons.w, _this.intCons.h);
        };
    },
    renderBlock:function (ctx) {

    },
    renderRunner:function(ctx){
        var _this = this;
        var runner = _this.intCons.runner;
        var w = this.intCons.w;
        var h = this.intCons.h;
        //按照图片尺寸设定人物宽高
        runner.size = [w * 0.2, w * 0.2 * 190 / 130];
        runner.centerPositon = (w - runner.size[0]) / 2;
        runner.positon = [runner.centerPositon, h - runner.size[1]];

        /*var runnerImg = ['./img/person_nm_1','./img/person_nm_2'];

        this.runner.normal[1].onload = function () {
            ctx.drawImage(_this.runner.normal[1], _this.runner.positon[0], _this.runner.positon[1], _this.runner.size[0], _this.runner.size[1]);
        }*/
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
        //背景

        //人

        //

    },
    countTime:function () {

    },
    bind:function () {
        //count_time

        //swiperUp
    }
};
paoku.init();