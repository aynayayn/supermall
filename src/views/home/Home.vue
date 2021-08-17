<template>
  <div id="home">
    <nav-bar class="home-nav">
      <div slot="center">购物街</div>
    </nav-bar>
    <tab-control :titles="['流行','新款','精选']"
                 @tabClick="tabClick"
                 ref="tabControl1"
                 :class="'tab-control'"
                 v-show="isShowTabControl"></tab-control>
    <scroll class="content"
            ref="scroll"
            :probe-type = "3"
            :pull-up-load = "true"
            @pullingUp = "loadMore">
      <home-swiper :banners="banners"
                   @swiperImageLoad="swiperImageLoad"></home-swiper>
      <home-recommend-view :recommends="recommends"></home-recommend-view>
      <home-feature-view></home-feature-view>
      <tab-control :titles="['流行','新款','精选']"
                   @tabClick="tabClick"
                   ref="tabControl2"></tab-control>
      <goods-list :goods="showGoods"></goods-list>
    </scroll>
    <back-top
      @click.native="backClick"
      v-show="isShowBackTop"></back-top>
  </div>
</template>

<script>
  import Scroll from "components/common/scroll/Scroll";

  import HomeSwiper from "./childComps/HomeSwiper";
  import HomeRecommendView from "./childComps/HomeRecommendView";
  import HomeFeatureView from "./childComps/HomeFeatureView";

  import NavBar from "components/common/navbar/NavBar";
  import TabControl from "components/content/tabControl/TabControl";
  import GoodsList from "components/content/goods/GoodsList";
  import BackTop from "components/content/backTop/BackTop";

  import {getHomeMultidata, getHomeGoods} from "network/home";
  import {debounce} from "common/utils";
  // 三、只emit一个事件并在不同组件中实现各自不同时段的监听【混入操作】 - 第2处代码
  import {itemListener} from "common/mixin";

  export default {
    name: "Home",
    mixins: [itemListener],// 三、只emit一个事件并在不同组件中实现各自不同时段的监听【混入操作】 - 第3处代码
    components: {
      Scroll,
      HomeSwiper,
      HomeRecommendView,
      HomeFeatureView,

      NavBar,
      TabControl,
      GoodsList,
      BackTop,
    },
    data() {
      return {
        banners: [],
        recommends: [],
        goods: {
          'pop': {page: 0, list: []},
          'new': {page: 0, list: []},
          'sell': {page: 0, list: []},
        },
        currentType: 'pop',
        isShowBackTop: false,
        tabOffsetTop: 0,
        isShowTabControl: false,
        saveY: 0,
        // itemImageLoad: null, // 二、只emit一个事件并在不同组件中实现各自不同时段的监听 - 第2处代码
      }
    },
    computed: {
      showGoods() {
        return this.goods[this.currentType].list
      },
    },
    created() {
      //1.请求多个数据
      this.getHomeMultidata();

      //2.请求商品数据
      this.getHomeGoods('pop');
      this.getHomeGoods('new');
      this.getHomeGoods('sell');

    },
    mounted() {
      // 图片加载完成的事件监听【没有防抖处理】
      /*this.$bus.$on('itemImageLoad', () => {
        //在mounted阶段也不定找得到$refs.scroll
        this.$refs.scroll && this.$refs.scroll.refresh();
      })*/

      // 一、先判断当前路由后使用this.$bus.$emit发射不同的事件 - 第2处代码
      /* const refresh = debounce(this.$refs.scroll.refresh, 500)
       this.$bus.$on('homeItemImageLoad', () => {
         this.$refs.scroll && refresh();
       })*/


      // 二、只emit一个事件并在不同组件中实现各自不同时段的监听 - 第3处代码 - 后面进行了混入操作
     /*const refresh = debounce(this.$refs.scroll.refresh, 200);
     this.itemImageLoad = () => {
       this.$refs.scroll && refresh();
     }
     this.$bus.$on('itemImageLoad', this.itemImageLoad);*/
    },
    activated() {
      this.$refs.scroll.refresh();
      this.$refs.scroll.scrollTo(0, this.saveY, 0);

      // 二、只emit一个事件并在不同组件中实现各自不同时段的监听 - 第4处代码
      /*this.$bus.$on('itemImageLoad', this.itemImageLoad);*/
    },
   /* beforeRouteLeave(from, to, next) {
      this.saveY = this.$refs.scroll.scroll.y;
      next();
    },*/
    deactivated() {
      // this.saveY = this.$refs.scroll.scroll.y;
      this.saveY = this.$store.state.scrollHeight;
      console.log(this.saveY);

      // 二、只emit一个事件并在不同组件中实现各自不同时段的监听 - 第5处代码
      // 三、只emit一个事件并在不同组件中实现各自不同时段的监听【混入操作】 - 第4处代码
      this.$bus.$off('itemImageLoad', this.itemImageLoad);
    },
    methods: {
      /*debounce(func, delay) {
        let timer = null;
        return function(...args) {
          if(timer)  clearTimeout(timer)

          timer = setTimeout(() => {
            func.apply(this, args)
          }, delay)
        }
      },*/
      /**
       * 事件监听相关的方法
       */
      tabClick(value) {
        switch(value) {
          case 0:
            this.currentType = 'pop';
            break;
          case 1:
            this.currentType = 'new';
            break;
          case 2:
            this.currentType = 'sell';
            break;
        }

        this.$refs.tabControl1.currentIndex = value;
        this.$refs.tabControl2.currentIndex = value;
      },
      backClick() {
        // 在500毫秒之内滚到最上方
        this.$refs.scroll.scrollTo(0, 0, 500);
      },
     /* contentScroll() {
        this.isShow = !this.isShow;
      },*/
       loadMore() {
        this.getHomeGoods(this.currentType);
        // 2s后才finishPullUp，才能进行下一次上拉加载
        setTimeout(() => {
          this.$refs.scroll.finishPullUp();
        }, 2000)
      },
      swiperImageLoad() {
        // 获取tabControl的offsetTop
        this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;
        console.log(this.tabOffsetTop);
      },

      /**
       * 网络请求相关的方法
       */
      getHomeMultidata() {
        getHomeMultidata().then(res => {
          this.banners = res.data.banner.list;
          this.recommends = res.data.recommend.list;
        })
      },
      getHomeGoods(type) {
        const page = this.goods[type].page + 1;
        getHomeGoods(type, page).then(res => {
          this.goods[type].list.push(...res.data.list);
          this.goods[type].page += 1;
        })
      },
    },
    watch: {
      /*"$store.state.imgLoadedCount": {
        // 需要实时监听对象属性的变化得将deep属性设置为true
        deep: false,
        handler: function(){
          this.$refs.scroll.scroll.refresh();
        }
      }*/
      "$store.state.scrollHeight": {
        deep: true,
        handler: function(newVal) {
          this.isShowBackTop = -newVal > 1000;
          this.isShowTabControl = -newVal > this.tabOffsetTop;
          // console.log(newVal);
          // console.log(this.isTabFixed);
        }
      }
    }
  }
</script>

<style scoped>
  /*#home {
    !*padding-top: 44px;
    padding-bottom: 56px;*!

    height: 100vh;
  }*/
  #home {
    /*padding-top: 44px;*/
    height: 100vh;
    position: relative;
  }
  .home-nav {
    background-color: var(--color-tint);
    color: #fff;

    /*position: fixed;
    left: 0;
    right: 0;
    top: 0;
    z-index: 2;*/
  }
  /*.tab-control {
    position: sticky;
    top: 44px;

    z-index: 2;
  }*/
 /* .content {
    !*vh:视口宽度单位 。设置显示页面滑动的局部区域的高度。*!
    height: calc(100vh - 93px);
    margin-top: 44px;
  }*/

  .content {
    overflow: hidden;

    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
  }
  .tab-control {
    position: relative;
    z-index: 3;
  }
</style>
