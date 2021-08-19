import {debounce} from "./utils";

// 三、只emit一个事件并在不同组件中实现各自不同时段的监听【混入操作】 - 第1处代码
export const itemImageLoadListener = {
  data() {
    return {
      itemImageLoad: null,
      newRefresh: null,
    }
  },
  mounted() {
    this.newRefresh = debounce(this.$refs.scroll.refresh, 200);
    this.itemImageLoad = () => {
      this.$refs.scroll && this.newRefresh();
    }
    this.$bus.$on('itemImageLoad', this.itemImageLoad);
    console.log('我是混入的内容');
  },
  // 专为keep-alive中的路由视图准备
  activated() {
    // const refresh2 = debounce(this.$refs.scroll.refresh, 200);
    this.itemImageLoad = () => {
      this.$refs.scroll && this.newRefresh();
    }
    this.$bus.$on('itemImageLoad', this.itemImageLoad);
    console.log('我是混入的内容');
  }
}


import BackTop from "components/content/backTop/BackTop";
export const  backTopClickListener = {
  components: {
    BackTop
  },
  data() {
    return {
      isShowBackTop: false,
    }
  },
  methods: {
    backTopClick() {
      this.$refs.scroll.scrollTo(0, 0);
    },
    // 把一句代码抽出来包成一个函数以便使用混入
    comparePositionYAnd1000(positionY) {
      this.isShowBackTop = -positionY > 1000;
    }
  }
}

