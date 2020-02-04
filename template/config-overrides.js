const { override, addBabelPlugin, addWebpackAlias } = require('customize-cra')

function disableMinimize(config) {
    config.optimization.minimizer[0].options.terserOptions.keep_classnames = true
    config.optimization.minimizer[0].options.terserOptions.keep_fnames = true

    return config
}

module.exports = override(
    addBabelPlugin('react-hot-loader/babel'),
    addWebpackAlias({ 'react-dom': '@hot-loader/react-dom' }),
    disableMinimize
)
