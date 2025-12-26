/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 金融级冷静 · 银灰绿蓝风配色
        // 主色系 - 银灰色（冷静专业）
        primary: '#5B7A8C',        // 主品牌色 - 银灰蓝（金融感）
        secondary: '#6B8E9F',     // 次要色 - 浅银灰蓝
        
        // 绿色系（金融属性 - 涨/积极）
        green: {
          50: '#F0F9F4',
          100: '#D4EDDC',
          200: '#A8D5B8',
          300: '#7CBE94',
          400: '#50A770',
          500: '#2E8B57',         // 主绿色 - 金融绿
          600: '#256F45',
          700: '#1C5333',
          800: '#133722',
          900: '#0A1B11',
        },
        
        // 蓝色系（信息/专业）
        blue: {
          50: '#F0F4F8',
          100: '#D4E3F0',
          200: '#A8C7E1',
          300: '#7CABD2',
          400: '#508FC3',
          500: '#3B7CB8',         // 主蓝色 - 金融蓝
          600: '#2F6393',
          700: '#234A6E',
          800: '#173149',
          900: '#0B1824',
        },
        
        // 银灰色系（主色调 - 冷静专业）
        silver: {
          50: '#F5F7FA',          // 背景色 - 银白
          100: '#E8ECF0',         // 浅银灰
          200: '#D1D9E1',         // 银灰边框
          300: '#BAC6D2',         // 中银灰
          400: '#A3B3C3',         // 银灰
          500: '#8CA0B4',         // 主银灰
          600: '#708095',         // 深银灰
          700: '#546076',         // 更深银灰
          800: '#384057',         // 深灰蓝
          900: '#1C2038',         // 最深灰蓝
        },
        
        // 中性色系（文字和边框）
        neutral: {
          50: '#F5F7FA',          // 背景色
          100: '#E8ECF0',         // 浅灰
          200: '#D1D9E1',         // 边框
          300: '#BAC6D2',         // 图标
          400: '#8A95A6',         // 次要文字
          500: '#6B7A8C',         // 中灰
          600: '#4C5A6B',         // 正文
          700: '#2D3A4A',         // 深灰
          800: '#1E2A3A',         // 更深灰
          900: '#0F1A2A',         // 最深灰
        },
        
        // 背景与表面
        light: '#F5F7FA',         // 整体背景色 - 银白
        surface: '#FFFFFF',       // 纯白色表面
        
        // 状态色（金融级）
        success: '#2E8B57',       // 成功/涨 - 金融绿
        warning: '#D4A574',       // 警告 - 暖银灰
        danger: '#C85A5A',        // 错误/跌 - 金融红
        info: '#3B7CB8',          // 信息 - 金融蓝
        
        // 金色系（深色模式用）
        gold: {
          50: '#FFF9E6',
          100: '#FFF2CC',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#D4AF37',         // 主金色 - 鎏金色
          600: '#B8941F',
          700: '#9C7A07',
          800: '#7F6000',
          900: '#634600',
        },
        
        // 兼容旧颜色（保留以支持现有组件）
        'tea-green': '#2E8B57',
        'light-green': '#50A770',
        'accent-orange': '#D4A574',
        'text-primary': '#2D3A4A',
        'text-secondary': '#6B7A8C',
        'warm-white': '#FFFFFF',
        'tea-white': '#F5F7FA',
      },
      fontFamily: {
        // 正文字体 - Inter（UI 字体）
        sans: [
          'Inter',
          'PingFang SC',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        // 标题字体 - Montserrat（品牌感、销售感）
        heading: [
          'Montserrat',
          'PingFang SC',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        // 数字字体 - Rubik（金额、汇率显示）
        display: [
          'Rubik',
          'Inter',
          'PingFang SC',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
      borderRadius: {
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'dialog': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

