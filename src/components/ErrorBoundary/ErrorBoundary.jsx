import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink mb-4">
            页面渲染出错
          </h1>
          <p className="text-ink-light mb-6">
            抱歉，页面遇到了一个错误，请尝试刷新。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-amber text-white rounded-lg hover:opacity-90 transition-opacity font-sans text-sm"
          >
            刷新页面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
