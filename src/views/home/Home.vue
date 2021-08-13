<template>
  <div id="home">
    <nav-bar class="home-nav">
      <div slot="center">购物街</div>
    </nav-bar>
    <scroll class="content"
            ref="scroll"
            :probe-type = "3"
            @scroll="contentScroll"
            :pull-up-load = "true">
      <home-swiper :banners="banners"></home-swiper>
      <home-recommend-view :recommends="recommends"></home-recommend-view>
      <home-feature-view></home-feature-view>
      <tab-control class="tab-control"
                   :titles="['流行','新款','精选']"
                   @tabClick="tabClick"></tab-control>
      <goods-list :goods="showGoods"></goods-list>
    </scroll>
    <back-top
      @click.native="backClick"
      v-show="isShow"></back-top>
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

  export default {
    name: "Home",
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
        isShow: false,
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
     /* this.$bus.$on('itemImageLoad', () => {
        //在mounted阶段也不定找得到$refs.scroll
        this.$refs.scroll && this.$refs.scroll.refresh();
      })*/
      const refresh = this.debounce(this.$refs.scroll.refresh, 500)
      this.$bus.$on('itemImageLoad', () => {
        refresh();
      })
    },
    methods: {
      debounce(func, delay) {
        let timer = null;
        return function(...args) {
          if(timer)  clearTimeout(timer)

          timer = setTimeout(() => {
            func.apply(this, args)
          }, delay)
        }
      },
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
            console.log(this.imgLoadedCount);
            break;
          case 2:
            this.currentType = 'sell';
            break;
        }
      },
      backClick() {
        // 在500毫秒之内滚到最上方
        this.$refs.scroll.scrollTo(0, 0, 500);
      },
      contentScroll() {
        this.isShow = !this.isShow;
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
    padding-top: 44px;
    height: 100vh;
    position: relative;
  }
  .home-nav {
    background-color: var(--color-tint);
    color: #fff;

    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    z-index: 2;
  }
  .tab-control {
   /* position: sticky;
    top: 44px;

    z-index: 2;*/
  }
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
</style>
