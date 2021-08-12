<template>
  <div class="wrapper" ref="wrapper">
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  import BScroll from 'better-scroll';
  export default {
    name: "Scroll",
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      pullUpLoad: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        scroll: null,
      }
    },
    updated() {
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        pullUpLoad: this.pullUpLoad,
        // 用于使得div，span等之类的标签可以被点击
        click: true
      })

      this.scroll.on('scroll', (position) => {
        // this.$emit('scroll', position);
      })

      this.scroll.on('pullingUp', () => {
        this.$emit('pullingUp');
      })
    },
    methods: {
      scrollTo(x, y, time = 300) {
        this.scroll.scrollTo(x, y, time);
      },
      finishPullUp() {
        this.scroll.finishPullUp();
      }
    }
  }
</script>

<style scoped>

</style>
