'use strict';
import Vue from 'vue';
import App from './App.vue';
import store from './store';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import mixin from './mixins/common/common';
import * as rules from 'vee-validate/dist/rules';
import Loading from './components/globals/Loading.vue';
import _ from 'lodash';
//------------------------------------------------------------
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
Vue.mixin(mixin);
Vue.component('Loading', Loading);
//-----------------------------------------------------------
for (let key in rules) {
    extend(key, rules[key]);
}
//------------------------------------------------------------
import './assets/css/app.scss';
//------------------------------------------------------------
Vue.config.productionTip = false;
new Vue({ store, render: h => h(App) }).$mount('#app');