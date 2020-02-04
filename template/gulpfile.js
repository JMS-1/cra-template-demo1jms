const fs = require('fs')
const gulp = require('gulp')
const gulpIf = require('gulp-if')
const gulpJsonModify = require('gulp-json-modify')
const gulpMessage = require('gulp-message')
const path = require('path')

//* Config

const semanticConfigPath = 'semantic.json'
const semanticStylesPath = 'src/styles/'

//* Helper

function getFile(path) {
    const fileRaw = fs.readFileSync(path)

    return String(fileRaw)
}

function getSemanticConfig() {
    const semanticConfigString = getFile(path.join(__dirname, semanticConfigPath))

    try {
        return JSON.parse(semanticConfigString)
    } catch (error) {
        console.error(error.message)
        return {}
    }
}

function getSemanticThemes() {
    const semanticConfig = getSemanticConfig()
    const semanticThemesPath = path.join(__dirname, semanticConfig.base, semanticConfig.paths.source.themes)

    if (fs.existsSync(semanticThemesPath)) {
        return fs.readdirSync(semanticThemesPath).filter(sub => {
            const isDirectory = fs.statSync(path.join(semanticThemesPath, sub)).isDirectory()
            const hasConfig = fs.existsSync(path.join(semanticThemesPath, sub, 'theme.config'))

            return isDirectory && hasConfig
        })
    } else {
        return []
    }
}

function requireSemantic(callback) {
    const semanticConfig = getSemanticConfig()

    require(path.join(__dirname, semanticConfig.base, 'gulpfile'))

    callback()
}

//* Gulp

//* Gulp Build Semantic

function semanticThemeBuild(theme) {
    return callback => {
        const semanticConfig = getSemanticConfig()

        gulpMessage.info(`[Semantic] [Themes] [${theme}] -> Building`)

        const semanticTasksFolder = path.join(__dirname, semanticConfig.base, 'tasks/build/')

        return gulp.parallel(
            require(path.join(semanticTasksFolder, 'assets')),
            require(path.join(semanticTasksFolder, 'css'))
        )(callback)
    }
}

function semanticThemeConfigModify(theme) {
    return () => {
        gulpMessage.info(`[Semantic] [Themes] [${theme}] -> Modifying Config`)

        return gulp
            .src(path.join(__dirname, semanticConfigPath))
            .pipe(
                gulpJsonModify({
                    key: 'paths.source.config',
                    value: `../${semanticStylesPath}themes/${theme}/config.json`,
                })
            )
            .pipe(
                gulpJsonModify({
                    key: 'paths.output.packaged',
                    value: `../public/semantic/${theme}/`,
                })
            )
            .pipe(gulp.dest(__dirname))
    }
}

function semanticConfigModify() {
    const semanticConfig = getSemanticConfig()

    const sementicSourceSitePath = `../${semanticStylesPath}site/`
    const sementicSourceThemesPath = `../${semanticStylesPath}themes/`
    const sementicOutputThemesPath = '../public/semantic/'

    return gulp
        .src(path.join(__dirname, semanticConfigPath))
        .pipe(
            gulpIf(
                semanticConfig.paths.source.site !== sementicSourceSitePath,
                gulpJsonModify({
                    key: 'paths.source.site',
                    value: sementicSourceSitePath,
                })
            )
        )
        .pipe(
            gulpIf(
                semanticConfig.paths.source.themes !== sementicSourceThemesPath,
                gulpJsonModify({
                    key: 'paths.source.themes',
                    value: sementicSourceThemesPath,
                })
            )
        )
        .pipe(
            gulpIf(
                semanticConfig.paths.output.themes !== sementicOutputThemesPath,
                gulpJsonModify({
                    key: 'paths.output.themes',
                    value: sementicOutputThemesPath,
                })
            )
        )
        .pipe(gulpIf(file => getFile(file.path) !== String(file.contents), gulp.dest(__dirname)))
}

function semanticThemesBuild(callback) {
    const semanticThemes = getSemanticThemes()

    if (semanticThemes.length === 0) {
        gulpMessage.warn('[Semantic] [Themes] -> No Themes Found!')
        callback()
        return
    }

    const tasks = []
    const themesTasks = []

    for (let i = 0; i < semanticThemes.length; i++) {
        const theme = semanticThemes[i]
        const themeTask = []

        themeTask.push(semanticThemeConfigModify(theme))
        themeTask.push(semanticThemeBuild(theme))

        themesTasks.push(gulp.series(...themeTask))
    }

    tasks.push(themesTasks)

    return gulp.series(tasks)(callback)
}

exports.themes = gulp.series(requireSemantic, semanticConfigModify, semanticThemesBuild)
