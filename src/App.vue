<template>
    <div id="app" class="containerx">
        <Loading v-if="loading"/>
        <b-row style="height: 88vh">
            <b-col cols="4">
                <b-table 
                    ref="tbl"
                    head-variant="light"
                    class="fixed-table-70"
                    striped
                    hover
                    bordered
                    selectable
                    empty-html="Hiç Kayıt Bulunamadı"
                    :show-empty="true"
                    :busy="loading"
                    select-mode="single"
                    @row-selected="onSelect"
                    sticky-header="81vh"
                    :items="notes"
                    :fields="fields"
                >
                </b-table>
                <b-pagination  
                    size="sm"
                    align="center" 
                    :value="page" 
                    :total-rows="total" 
                    :per-page="100" 
                    @change="changePage" 
                />
            </b-col>
            <b-col cols="8" >
                <b-card v-if="selected" no-body>
                    <b-tabs card>
                        <b-tab v-for="(record, i) in selected.contents" :key="'tab' + i" :title="record.filename" :active="i === 0">
                            <div :id="`code-editor-viewer-${i}`" class="code-viewer">{{ record.content  }}</div>
                        </b-tab>
                    </b-tabs>
                </b-card>
                <b-card v-else>
                    <b-card-text>Soldan Seçim Yapın</b-card-text>
                </b-card>
            </b-col>
        </b-row>
        <b-row>
            <b-col cols="12">
                <hr class="dashed">
            </b-col>
        </b-row>
        <b-row style="height: 7vh">
            <b-col cols="4">
                <b-row>
                    <b-col cols="6">
                        <b-select class="ml-2 mt-3" size="sm" @change="changeNotebook" :options="notebooks">
                            <b-form-select-option :value="null" selected>Hiçbiri</b-form-select-option>
                        </b-select>
                    </b-col>
                    <b-col cols="6">
                        <b-input size="sm" class="mt-3" :value="search" :debounce="500" @update="doSearch" placeholder="Ara" />
                    </b-col>
                </b-row>
            </b-col>
            <b-col cols="8">
                <div class="d-flex justify-content-end mt-3">
                    <b-button variant="primary" @click="$bvModal.show('add-modal');" style="width: 100px;" size="sm">Yeni</b-button>
                    <b-button variant="primary" @click="$bvModal.show('edit-modal');" class="ml-2" style="width: 100px;" size="sm" :disabled="!selected">Düzenle</b-button>
                    <b-button variant="danger" @click="doDelete()" class="ml-2" style="width: 100px;" size="sm" :disabled="!selected">Sil</b-button>
                </div>
            </b-col>
        </b-row>
        <add-modal />
        <edit-modal v-if="selected" :selected="selected" />
    </div>
</template>
<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';
import AddModal from './components/globals/AddModal.vue';
import EditModal from './components/globals/EditModal.vue';
import _ from 'lodash';
export default {
    components: { AddModal, EditModal },
    data(){
        return {
            selected: null,
            fields: [
                { key: 'title', label: 'Başlık', thStyle: 'width:60%' },
                { key: 'notebook', label: 'Notebook', thStyle: 'width:40%' }
            ]
        }
    },
    computed: {
        ...mapGetters(
            {
                notebooks: 'notebooks',
                notes: 'notes',
                notebook: 'notebook',
                search: 'search',
                page: 'page',
                total: 'total'
            }
        ),
    },
    methods: {
        ...mapActions(
            { 
                bootstrap: 'bootstrap',
                fetchNotes: 'fetchNotes',
                countNotes: 'countNotes',
                deleteNote: 'deleteNote' 
            }
        ),

        ...mapMutations(
            { 
                setPage: 'setPage',
                setSearch: 'setSearch',
                setNotebook: 'setNotebook' 
            }
        ),

        onSelect(selected) {
            if (this.selected) {
                for (let content of this.selected.contents) {
                    if (content.editor) {
                        content.editor.destroy();
                    }
                }
            }

            if (_.size(selected) === 0) {
                return this.selected = null;
            }

            this.selected = _.first(selected);
            let modelist = ace.require('ace/ext/modelist');
            for (let i = 0; i < _.size(this.selected.contents); i++) {
                this.$nextTick(
                    () => {
                        this.selected.contents[i].editor = ace.edit(`code-editor-viewer-${i}`);
                        this.selected.contents[i].editor.setTheme('ace/theme/xcode');
                        this.selected.contents[i].editor.session.setMode(modelist.getModeForPath(this.selected.contents[i].filename).mode);
                        this.selected.contents[i].editor.setReadOnly(true);
                        this.selected.contents[i].editor.setValue(this.selected.contents[i].content, 1);
                    }
                );        
            }
        },

        async changeNotebook(notebook) {
            try {
                this.setLoading(true);
                this.setNotebook(notebook);
                await this.fetchNotes();
                await this.countNotes();
            } catch (error) {
                this.setError(error);
            } finally {
                this.setLoading(false);
            }
        },

        async doSearch(search) {
            try {
                this.setLoading(true);
                this.setSearch(search);
                await this.fetchNotes();
                await this.countNotes();
            } catch (error) {
                this.setError(error);
            } finally {
                this.setLoading(false);
            }
        },

        async doDelete() {
            try {
                this.setLoading(true);
                await this.deleteNote({ id: this.selected.id });
            } catch (error) {
                this.setError(error);
            } finally {
                this.setLoading(false);
            }
        },

        async changePage(page) {
            try {
                this.setLoading(true);
                this.setPage(page);
                await this.fetchNotes();
            } catch (error) {
                this.setError(error);
            } finally {
                this.setLoading(false);
            }
        }
    },
    async created() {
        try {
            this.setLoading(true);
            await this.bootstrap();
        } catch (error) {

        } finally {
            this.setLoading(false);
        }
    }
}
</script>