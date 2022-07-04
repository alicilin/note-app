module.exports = {
    configureWebpack: {
        externals: {
            'fs-extra': 'commonjs fs-extra',
            'fs': 'commonjs fs',
            'knex': 'commonjs knex',
            'sqlite3': 'commonjs sqlite3',
        },
        module: {
            rules: [
                {
                    test: /\.mp3$/,
                    loader: 'url-loader'
                }
            ],
        },
        target: 'electron-renderer'
    },
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'public/background.js',
            externals: ['sqlite3', 'knex'],
            builderOptions: {
                appId: "com.note.app",
                productName: "NoteApp",
                copyright: "Ali Firat Guler",
                asar: true,
                win: {
                    icon: "./public/icon.png", 
                    target: [
                        {
                            target: "portable",
                            arch: [
                                "x64"
                            ]
                        }
                    ],
                    publisherName: "Ali Fırat Güler"
                }
            }
        }
    }
}