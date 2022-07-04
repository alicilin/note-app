'use strict';
const loader = {
    namespaced: true,
    state: {
        loading: false
    },
    mutations: {
        setLoading(state, loading) {
            return state.loading = loading;
        }
    },
    getters: {
        loading(state) {
            return state.loading;
        }
    }
};

export default loader;