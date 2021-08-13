import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    imgLoadedCount: 0
  },
  mutations: {
    incrementImgLoadedCount(state) {
      state.imgLoadedCount++;
    }
  }
})

export default store
