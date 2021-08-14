import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    imgLoadedCount: 0,
    scrollHeight: 0
  },
  mutations: {
    incrementImgLoadedCount(state) {
      state.imgLoadedCount++;
    },
    setScrollHeight(state, position) {
      state.scrollHeight = position
      //console.log(state.scrollHeight);
    }
  }
})

export default store
