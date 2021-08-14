<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav-bar"></detail-nav-bar>
    <scroll class="content" ref="detailScroll">
      <detail-swiper :top-images="topImages"></detail-swiper>
      <detail-base-info :goods="goodsInfo"></detail-base-info>
      <detail-shop-info :shop="shop"></detail-shop-info>
      <detail-goods-info :detail-info="detailInfo"
                         @imgLoad="imgLoad"></detail-goods-info>
      <detail-param-info :param-info="paramInfo"></detail-param-info>
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

  import Scroll from "components/common/scroll/Scroll";

  import {getDetail, GoodsInfo, GoodsParam, Shop} from "network/detail"
  export default {
    name: "Detail",
    data() {
      return {
        iid: null,
        topImages: [],
        goodsInfo: {},
        paramInfo: {},
        shop: {},
        detailInfo: {},
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
      })
    },
    methods: {
      imgLoad() {
        this.$refs.detailScroll.refresh();
      }
    },
    components: {
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      Scroll,
      DetailGoodsInfo,
      DetailParamInfo,
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
