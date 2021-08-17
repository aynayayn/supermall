import {debounce} from "./utils";

// 三、只emit一个事件并在不同组件中实现各自不同时段的监听【混入操作】 - 第1处代码
export const itemListener = {
  data() {
    return {
      itemImageLoad: null,
      newRefresh: null,
    }
  },
  mounted() {
    this.newRefresh = debounce(this.$refs.scroll.refresh, 200);
    this.itemImageLoad = () => {
      this.$refs.detailScroll && this.newRefresh();
    }
    this.$bus.$on('itemImageLoad', this.itemImageLoad);
    console.log('我是混入的内容');
  },
  activated() {
    // const refresh2 = debounce(this.$refs.scroll.refresh, 200);
    this.itemImageLoad = () => {
      this.$refs.detailScroll && this.newRefresh();
    }
    this.$bus.$on('itemImageLoad', this.itemImageLoad);
    console.log('我是混入的内容');
  }
}


