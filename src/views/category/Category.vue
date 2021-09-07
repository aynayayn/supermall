<template>
  <div id="category">
    <nav-bar class="category-nav">
      <div slot="center">商品分类</div>
    </nav-bar>
    <div class="category-content">
      <div class="scroll-left">
        <scroll class="content-left">
          <side-bar-menu :list="categories"
                         @selectItem="sidebarItemClick"></side-bar-menu>
        </scroll>
      </div>
      <div class="scroll-right">
        <scroll class="content-right"
                ref="scroll"
                :probe-type="3"
                @scroll="contentScroll">
          <three-column-list
            :list="categoryData[currentIndex].subcategories.list"
            :if-subcategories-show="true" />
          <tab-control class="tab-control"
                       :titles="['流行', '新款', '销量']"
                       @tabClick="tabClick"
                       ref="tabControl" />
          <goods-list :goods="categoryData[currentIndex].categoryDetail[currentType]" />
        </scroll>
      </div>
    </div>
    <back-top v-show="isShowBackTop"
              @click.native="backTopClick"></back-top>

  </div>
</template>

<script>
  import NavBar from "components/common/navbar/NavBar";
  import SideBarMenu from "./childComps/SideBarMenu";
  import Scroll from "components/common/scroll/Scroll";
  import ThreeColumnList from "components/content/threeColumnList/ThreeColumnList";
  import TabControl from "components/content/tabControl/TabControl";
  import GoodsList from "components/content/goods/GoodsList";
  import {getCategories, getSubcategories, getCategoryDetail} from "network/category"
  import {POP, NEW, SELL} from "common/const";

  import {itemImageLoadListener, backTopClickListener} from "common/mixin"
  export default {
    name: "Category",
    mixins: [itemImageLoadListener, backTopClickListener],
    components: {
      NavBar,
      SideBarMenu,
      Scroll,
      ThreeColumnList,
      TabControl,
      GoodsList,
    },
    data() {
      return {
        categories: [],
        categoryData: {},
        currentIndex: -1,
        tabOffsetTop: 0,
        isShowTabControl: false,
        currentType: 'pop',
      }
    },
    created() {
      // 1.请求类别名称列表 和 第一个类别的子类别及详细数据
      this._getCategories();
    },
    activated() {
      this.$refs.scroll.refresh();
    },
    deactivated() {
      this.$bus.$off('itemImageLoad', this.itemImageLoad);
    },
    methods: {
      _getCategories() {
        getCategories().then(res => {
          // 1.把类别名称列表做一个存储
          this.categories = res.data.category.list;

          // 2. 初始化每个类别的子数据
          for(let i = 0; i < this.categories.length; i++) {
            this.categoryData[i] = {
              subcategories: {},
              categoryDetail: {
                'pop': [],
                'new': [],
                'sell': [],
              }
            }
          }

          // 3.请求第一个类别的子类别及详细数据
          this._getSubcategories(0);
        });
      },
      _getSubcategories(index) {
        this.currentIndex = index;
        const maitKey = this.categories[index].maitKey;
        getSubcategories(maitKey).then(res => {
          this.categoryData[index].subcategories = res.data;
          this.categoryData = {...this.categoryData};
          this._getCategoryDetail(POP);
          this._getCategoryDetail(NEW);
          this._getCategoryDetail(SELL);
        });
      },
      _getCategoryDetail(type) {
        // 1. 获取请求的miniWallkey
        const miniWallkey = this.categories[this.currentIndex].miniWallkey;
        // 2. 发送请求，传入miniWallkey和type
        getCategoryDetail(miniWallkey, type).then(res => {
          // 3. 将获取的数据保存下来
          this.categoryData[this.currentIndex].categoryDetail[type] = res;
          this.categoryData = {...this.categoryData};
        });
      },
      sidebarItemClick(val) {
        this.currentIndex = val;
        // 请求对应类别的子类别及详细数据
        this._getSubcategories(this.currentIndex);
        // 在tab-control组件中把它的currentIndex重置为0，并且通过事件把currentIndex发出来，使得this.currentType='pop'
        this.$refs.tabControl.resetCurrentIndex();
      },
      contentScroll(position) {
        // console.log(position.y);
        this.isShowTabControl = -position.y > this.tabOffsetTop;
        // this.isShowBackTop = -position.y > 1000;
        this.comparePositionYAnd1000(position.y); //专门把上句包成一个函数以便使用混入
      },
      tabClick(value) {
        switch (value) {
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
      }
    },
  }
</script>

<style scoped>
  .category-nav {
    background-color: var(--color-tint);
    color: #fff;
    font-weight: bold;
  }
  .category-content {
    display: flex;
  }
  .category-content .scroll-left {
    width: 100px;
  }
  .category-content .scroll-right {
    flex: 1;
  }
  .category-content .scroll-left .content-left {
    position: fixed;
    top: 44px;
    bottom: 49px;
    left: 0;

    width: 100px;

    z-index: -1;
  }
  .category-content .scroll-right .content-right {
    position: fixed;
    top: 44px;
    bottom: 49px;

    z-index: -1;
  }
  .tab-control {
    margin-top: 20px;
  }
</style>
