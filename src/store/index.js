'use strict';
import Vue from 'vue';
import Vuex from 'vuex';
import loader from './modules/loader';
import knex from '@/loaders/knex';
import _ from 'lodash';
//--------------------------------------------------
let modules = {loader };
let state = {
    page: 1,
    total: 0,
    notebook: null,
    search: null,
    notes: [],
    notebooks: []
};

let getters = {
    notebooks: state => state.notebooks,
    notes: state => state.notes,
    notebook: state => state.notebook,
    search: state => state.search,
    page: state => state.page,
    total: state => state.total
};

let mutations = {
    setNotes(state, notes) {
        Vue.set(state, 'notes', notes);
    },

    setNotebooks(state, notebooks) {
        Vue.set(state, 'notebooks', notebooks);
    },

    setPage(state, page) {
        state.page = page;
    },

    setTotal(state, total) {
        state.total = total;
    },

    setSearch(state, search) {
        state.search = search;
        state.page = 1;
    },

    setNotebook(state, notebook) {
        state.notebook = notebook;
        state.page = 1;
    }
};

let actions = {
    async bootstrap({ dispatch }) {
        dispatch('fetchNotes');
        dispatch('countNotes');
        dispatch('fetchNotebooks');
    },

    async fetchNotes({ commit, state }) {
        try {
            let offset = (Math.abs(state.page - 1) * 100);
            let builder = knex('notes').limit(100).offset(offset).orderBy('id', 'desc');
            if (state.search) {
                builder.whereIn('id', knex('notes_fts').whereRaw('notes_fts match ?', [state.search]).select('rowid'));
            }

            if (state.notebook) {
                builder.where('notebook', state.notebook);
            }
            
            let mapper = x => ({ ...x, contents: JSON.parse(x['contents']) });
            let notes = _.map(await builder.select('*'), mapper);
            commit('setNotes', notes);
        } catch (error) {
            throw error;
        }
    },

    async countNotes({ commit, state }) {
        try {
            let builder = knex('notes').count('id as total');
            if (state.search) {
                builder.whereIn('id', knex('notes_fts').whereRaw('notes_fts match ?', [state.search]).select('rowid'));
            }

            if (state.notebook) {
                builder.where('notebook', state.notebook);
            }

            commit('setTotal', _.get(await builder.first(), 'total', 0));
        } catch (error) {
            throw error;
        }
    },

    async fetchNotebooks({ commit }) {
        try {
            let notebooks = await (
                knex('notes')
                    .groupBy('notebook')
                    .orderBy('notebook', 'asc')
                    .pluck('notebook')
            );

            commit('setNotebooks', notebooks);
        } catch (error) {
            throw error;
        }
    },

    async addNote({ dispatch }, { title, notebook, contents }) {
        try {
            await knex('notes').insert({ title, notebook, contents: JSON.stringify(contents) });
            await dispatch('fetchNotes');
            await dispatch('countNotes');
            await dispatch('fetchNotebooks');
        } catch (error) {
            throw error;
        }
    },

    async updateNote({ dispatch }, { id, title, notebook, contents }) {
        try {
            await knex('notes').where('id', id).update({ title, notebook, contents: JSON.stringify(contents) });
            await dispatch('fetchNotes');
            await dispatch('countNotes');
            await dispatch('fetchNotebooks');
        } catch (error) {
            throw error;
        }
    },

    async deleteNote({ dispatch }, { id }) {
        try {
            await knex('notes').where('id', id).delete();
            await dispatch('fetchNotes');
            await dispatch('countNotes');
            await dispatch('fetchNotebooks');
        } catch (error) {
            throw error;
        }
    },

};

Vue.use(Vuex);
let store = new Vuex.Store(
    {
        namespaced: true,
        getters: getters,
        actions: actions,
        modules: modules,
        state: state,
        mutations: mutations
    }
);
//--------------------------------------------------
export default store;

