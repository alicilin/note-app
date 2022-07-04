'use strict';
import { mapGetters, mapMutations } from 'vuex';
import moment from 'moment-timezone';
import _ from 'lodash';

export default {
    data() {
        return {}
    },
    computed: {
        ...mapGetters({ loading: 'loader/loading' })
    },
    methods: {
        ...mapMutations({ setLoading: 'loader/setLoading' }),
        moment,
        setError(error) {
            this.$bvToast.toast(
               error.message,
                {
                    title: 'Error',
                    variant: 'danger',
                    solid: true,
                    appendToast: true,
                    autoHide: 2000
                }
            );
        },
        getValidationState({ dirty, validated, valid = null }) {
            return dirty || validated ? valid : null;
        }
    }
};