module.exports = {
    presets: ['@vue/cli-plugin-babel/preset', '@babel/preset-env'],
    plugins: [
        ['@babel/proposal-decorators', { legacy: true }],
        ['@babel/proposal-class-properties', { loose: true }],
        ["@babel/plugin-transform-private-property-in-object", { "loose": true }],
        ["@babel/plugin-transform-private-methods", { "loose": true }],
        ['@babel/plugin-proposal-optional-chaining', { "loose": true }],
        ['@babel/plugin-transform-class-properties']
    ],
}
