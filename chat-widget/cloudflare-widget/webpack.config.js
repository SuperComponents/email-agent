const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/widget-wrapper.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'widget.js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', {
                  runtime: 'automatic'
                }],
                '@babel/preset-typescript'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'tailwindcss',
                    'autoprefixer',
                  ],
                },
              },
            },
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/lib': path.resolve(__dirname, 'src/lib'),
        '@/hooks': path.resolve(__dirname, 'src/hooks'),
        '@/providers': path.resolve(__dirname, 'src/providers'),
        '@/shared': path.resolve(__dirname, 'src/shared.ts'),
        // Stub out the agents module since it's Cloudflare-specific
        'agents': path.resolve(__dirname, 'src/agents-stub'),
        'agents/react': path.resolve(__dirname, 'src/agents-stub/react'),
        'agents/ai-react': path.resolve(__dirname, 'src/agents-stub/ai-react'),
        'agents/schedule': path.resolve(__dirname, 'src/agents-stub/schedule'),
        'agents/ai-chat-agent': path.resolve(__dirname, 'src/agents-stub/ai-chat-agent'),
      }
    },
    plugins: [
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'widget.css',
        })
      ] : [])
    ],
    devServer: {
      port: 3002,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      hot: true,
    },
    externals: {
      // Don't bundle server-only dependencies
      'cloudflare:workers': 'commonjs cloudflare:workers',
    }
  };
}; 