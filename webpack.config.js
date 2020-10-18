const path = require("path");
const { v4: uuidv4 } = require('uuid');

const devPort = 8081;

const appJson = {
    startup_app: {
      name: "Example WebRTC with OpenFin",
      description: "Example WebRTC with OpenFin",
      uuid: "Example WebRTC with OpenFin",
      autoShow: true,
      frame: true,
      defaultCentered: true,
      resizable: true,
      saveWindowState: true,
      defaultHeight: 400,
      defaultWidth: 400,
      backgroundThrottling: true,
    },
    runtime: {
      arguments: "",
      version: "stable",
    },
  };
  
const HtmlwebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './example.tsx',
    devtool: 'inline-source-map',
    stats: {
        logging: 'verbose',
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        alias: {
            'openfin-webrtc-client': path.resolve(__dirname, 'node_modules/openfin-webrtc-client')
        }
    },
    plugins: [
        new HtmlwebpackPlugin({
            title: 'WebRTC Example',
            template: 'index.html',
            filename: 'index.html'
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: devPort,
        hotOnly: true,
        before: (app) => {
            app.get('/app.json', (req, res) => {
                console.log(req.query.blp);
                let appUrl = `http://localhost:${devPort}/index.html`;
                if (req.query.blp === 'true') {
                    appUrl += '?blp=true';
                }
                const json = JSON.parse(JSON.stringify(appJson));
                json.startup_app.uuid = uuidv4();
                json.startup_app.url = appUrl;
                res.status(200).json(json);
            })
        }
    }
};