<template>
  <div id="detail">
    <detail-nav-bar
      class="detail-nav-bar"
      @titleClick="titleClick"
      ref="navbar"></detail-nav-bar>
    <scroll
      class="content"
      ref="scroll"
      :probe-type="3"
      @scroll="contentScroll">
      <detail-swiper :top-images="topImages"></detail-swiper>
      <detail-base-info :goods="goodsInfo"></detail-base-info>
      <detail-shop-info :shop="shop"></detail-shop-info>
      <detail-goods-info :detail-info="detailInfo"
                         @detailInfoImageLoad="detailInfoImageLoad"></detail-goods-info>
      <detail-param-info
        :param-info="paramInfo"
        ref="param"></detail-param-info>
      <detail-comment-info
        :comment-info="commentInfo"
        ref="comment"></detail-comment-info>
      <goods-list
        :goods="recommends"
        ref="recommend"></goods-list>
    </scroll>
  </div>
</template>

<script>
  import DetailNavBar from "./childComps/DetailNavBar";
  import DetailSwiper from "./childComps/DetailSwiper";
  import DetailBaseInfo from "./childComps/DetailBaseInfo";
  import DetailShopInfo from "./childComps/DetailShopInfo";
  import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
  import DetailParamInfo from "./childComps/DetailParamInfo";
  import DetailCommentInfo from "./childComps/DetailCommentInfo";

  import Scroll from "components/common/scroll/Scroll";
  import GoodsList from "components/content/goods/GoodsList";

  import {getDetail, getRecommend,  GoodsInfo, GoodsParam, Shop} from "network/detail"
  import {debounce} from "common/utils";
  // 三、只emit一个事件并在不同组件中实现各自不同时段的监听【混入操作】 - 第5处代码
  import {itemListener} from "common/mixin";

  export default {
    name: "Detail",
    mixins: [itemListener],// 三、只emit一个事件并在不同组件中实现各自不同时段的监听【混入操作】 - 第6处代码
    data() {
      return {
        iid: null,
        topImages: [],
        goodsInfo: {},
        paramInfo: {},
        shop: {},
        detailInfo: {},
        commentInfo: {},
        recommends: [],
        // itemImageLoad: null, // 二、只emit一个事件并在不同组件中实现各自不同时段的监听 - 第6处代码
        themeTopYs: [],
      }
    },
    created() {
      // 1.保存传入的iid
      this.iid = this.$route.params.id;
      console.log(this.iid);

      // 2.根据iid请求商品详情数据
      getDetail(this.iid).then(res => {
        console.log(res);
        // 1. 获取顶部的轮播数据
        const data = res.result;
        this.topImages = data.itemInfo.topImages;

        // 2.获取商品信息
        this.goodsInfo = new GoodsInfo(data.itemInfo, data.columns, data.shopInfo.services);

        // 3.获取店铺信息
        this.shop = new Shop(data.shopInfo);

        // 4.获取商品详情信息
        this.detailInfo = data.detailInfo;

        // 5.获取商品参数信息
        this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

        // 6. 取出商品评论信息
        if(data.rate.cRate !== 0) {
          this.commentInfo = data.rate.list[0];
        }

        // 获取到数据后的回调中拿的数据也不正确，因为DOM还没渲染完
        this.themeTopYs = []

        this.themeTopYs.push(0);
        this.themeTopYs.push(this.$refs.param.$el.offsetTop - 44);
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop - 44);
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop - 44);
        console.log(this.themeTopYs);

        // 渲染完了DOM但是图片还未完全加载时会回调，数据依然是不正确的
        this.$nextTick(() => {
          this.themeTopYs = []

          this.themeTopYs.push(0);
          this.themeTopYs.push(this.$refs.param.$el.offsetTop - 44);
          this.themeTopYs.push(this.$refs.comment.$el.offsetTop - 44);
          this.themeTopYs.push(this.$refs.recommend.$el.offsetTop - 44);
          console.log(this.themeTopYs);
        })
      })

      // 3.获取推荐板块的数据
      getRecommend().then(res => {
        console.log(res);
        this.recommends = res.data.list;
      })

    },
    mounted() {
      // 一、先判断当前路由后使用this.$bus.$emit发射不同的事件 - 第3处代码
      /*const refresh = debounce(this.$refs.scroll.refresh, 200);
      this.$bus.$on('recommendItemImageLoad', () => {
        this.$refs.scroll && refresh();
      })*/


      // 二、只emit一个事件并在不同组件中实现各自不同时段的监听 - 第7处代码 - 后面进行了混入操作
      /*const refresh = debounce(this.$refs.scroll.refresh, 200);
      this.itemImageLoad = () => {
        this.$refs.scroll && refresh();
      }
      this.$bus.$on('itemImageLoad', this.itemImageLoad);*/
    },
    /*updated() {
      // updated()中拿的offsetTop数据也是错的，因为当图片加载完成后并不会回调updated。
      this.themeTopYs = []

      this.themeTopYs.push(0);
      this.themeTopYs.push(this.$refs.param.$el.offsetTop);
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
      this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
      console.log(this.themeTopYs);
    },*/
    destroyed() {
      // 二、只emit一个事件并在不同组件中实现各自不同时段的监听 - 第8处代码
      // 三、只emit一个事件并在不同组件中实现各自不同时段的监听【混入操作】 - 第7处代码
      this.$bus.$off('itemImageLoad', this.itemImageLoad);
    },
    methods: {
      // 方案1第2处代码
      /*detailInfoImageLoad() {
        // 前面有混入。在混入中，在mounted阶段便将debounce(fresh, delay)的返回值进行了保存
        this.newRefresh();
      }*/

      // 方案2第4处代码(:detailInfoImageLoad="detailInfoImageLoad")
      detailInfoImageLoad() {
        this.$refs.scroll.refresh();

        // 此处拿的offsetTop值最终是正确的。图片加载过程中会防抖式发出自定义事件，然后会进行offsetTop更新
        this.themeTopYs = []

        this.themeTopYs.push(0);
        this.themeTopYs.push(this.$refs.param.$el.offsetTop);
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
        console.log(this.themeTopYs);
      },

      titleClick(index) {
        // -this.themeTopYs[index]是负数，this.themeTopYs[index]都是正数
        this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 200);
      },

      contentScroll(position) {
        // 1.获取位置的y值
        const positionY = position.y;
        // 2.positionY和this.themeTopYs中的值进行对比
        if(-positionY > this.themeTopYs[0]  && -positionY < this.themeTopYs[1])
          this.$refs.navbar.currentIndex = 0;
        if(-positionY > this.themeTopYs[1]  && -positionY < this.themeTopYs[2])
          this.$refs.navbar.currentIndex = 1;
        if(-positionY > this.themeTopYs[2]  && -positionY < this.themeTopYs[3])
          this.$refs.navbar.currentIndex = 2;
        if(-positionY > this.themeTopYs[3])
          this.$refs.navbar.currentIndex = 3;
      },
    },
    components: {
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      Scroll,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      GoodsList,
    }
  }
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;

    height: 100vh;
  }

  .detail-nav-bar {
    position: relative;
    z-index: 10;
    background-color: #fff;
  }

  .content {
    height: calc(100vh - 44px);
  }
</style>
