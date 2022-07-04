<template>
    <div>
        <b-modal 
            id="add-modal" 
            @show="onShow"
            @close="onClose"
            scrollable 
            size="xl" 
            centered
        >
            <validation-observer ref="observer">
                <b-row>
                    <b-col cols="6">
                       <validation-provider
                            name="Başlık"
                            :rules="{ required: true, max: 100 }"
                            v-slot="validationContext"
                        >
                            <b-form-group label="Başlık">
                                <b-form-input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="form.title" 
                                    placeholder="Başlık"
                                >
                                </b-form-input>
                            </b-form-group>
                       </validation-provider>
                    </b-col>
                    <b-col cols="6">
                       <validation-provider
                            name="NoteBook"
                            :rules="{ required: true, max: 100 }"
                            v-slot="validationContext"
                        >
                            <b-form-group label="Notebook">
                                <b-input-group>
                                    <b-form-select 
                                        v-if="isRaw === false" 
                                        v-model="form.notebook"
                                        :options="notebooks"
                                        :state="getValidationState(validationContext)"
                                    >
                                    </b-form-select>
                                    <b-input 
                                        v-else
                                        type="text" 
                                        class="form-control" 
                                        v-model="form.notebook" 
                                        placeholder="Bir Notebook Adı Girin" 
                                    >
                                    </b-input>
                                    <b-input-group-append>
                                        <b-button 
                                            @click="isRaw = !isRaw" 
                                            variant="outline-primary"
                                        >
                                            {{ isRaw ? 'Seç' : 'Yeni' }}
                                        </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-form-group>
                       </validation-provider>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col cols="12">
                        <b-card no-body>
                            <b-tabs card>
                                <b-tab v-for="(record, i) in form.contents" :key="'tab' + i" :title="record.filename">
                                    <b-form-group label="Dosya Adı (Uzantılı Hali)">
                                        <b-input 
                                            type="text" 
                                            class="form-control" 
                                            v-model="record.filename" 
                                            placeholder="Dosya Adı" 
                                        >
                                        </b-input>
                                    </b-form-group>
                                    <b-form-group label="Kod">
                                        <div :id="`code-editor-${i}`" class="code">{{ record.content  }}</div>
                                    </b-form-group>
                                </b-tab>
                                <template #tabs-end>
                                    <b-nav-item role="presentation" @click.prevent="newTab" href="#"><b>+</b></b-nav-item>
                                </template>
                            </b-tabs>
                        </b-card>
                    </b-col>
                </b-row>
            </validation-observer>
            <template v-slot:modal-footer>
                <b-button @click="save()" class="mr-1" variant="primary">Ekle</b-button>
                <b-button @click="close()" variant="danger">Kapat</b-button>
            </template>
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import _ from 'lodash';
export default {
    data() {
        return {
            isRaw: false,
            tabIndex: 0,
            watcher: null,
            form: {
                title: null,
                notebook: null,
                contents: []
            }
        };
    },
    computed: {
        ...mapGetters(
            {
                notebooks: 'notebooks'
            }
        ),

        filenames() {
            return _.map(this.form.contents, x => x.filename);
        }
    },

    methods: {
        ...mapActions({ addNote: 'addNote' }),

        async newTab() {
            let content = {
                filename: 'test.js',
                content: 'console.log("hello world")'
            }

            this.form.contents.push(content);
        },

        close() {
            this.$bvModal.hide('add-modal');
        },

        async save() {
            try {
                let isValid = await this.$refs.observer.validate();
                if (isValid === false) {
                    return;
                }

                let contents = [];
                for (let i = 0; i < _.size(this.form.contents); i++) {
                    contents.push(
                        {
                            filename: this.form.contents[i].filename,
                            content: this.form.contents[i].editor.getValue()
                        }
                    )
                }

                let body = { 
                    title: this.form.title, 
                    notebook: this.form.notebook, 
                    contents: contents
                };

                await this.addNote(body);
                this.$bvModal.hide('add-modal');
            } catch (error) {
                this.setError(error);
            }
        },

        onShow() {
            this.form = {
                title: null,
                notebook: null,
                contents: [
                    {
                        filename: 'test.js',
                        content: 'console.log("hello world")'
                    }
                ]
            }

            this.createEditor(this.filenames);
            this.watcher = this.$watch('filenames', this.createEditor, { deep: true, immediate: true });
        },

        async createEditor(values) {
            await this.$nextTick();
            let modelist = ace.require('ace/ext/modelist');
            for (let i = 0; i < _.size(values); i++) {
                this.$nextTick(
                    () => {
                        if (!this.form.contents[i].editor) {
                            this.form.contents[i].editor = ace.edit(`code-editor-${i}`);
                            this.form.contents[i].editor.setTheme('ace/theme/xcode');
                        }
                        
                        this.form.contents[i].editor.session.setMode(modelist.getModeForPath(values[i]).mode);
                    }
                );
            }
        },

        onClose() {
            this.watcher();
            this.watcher = null;
            _.each(this.form.contents, x => x.editor ? x.editor.destroy(): null);
        }
    }
};
</script>