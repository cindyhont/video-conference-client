const 
  path = require('path'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  Dotenv = require('dotenv-webpack'),
  pages = ['index','room']

module.exports = {
  watch:false,
  mode:'production',
  entry: pages.map(page=>({[page]:`./src/${page}/index.ts`})).reduce((p,c)=>({...p,...c})),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean:true
  },
  plugins:[
    new Dotenv(),
    ...pages.map(page=>new HtmlWebpackPlugin({
      template:`./src/${page}/index.html`,
      chunks:[page],
      filename:`${page}.html`
    }))
  ]
};