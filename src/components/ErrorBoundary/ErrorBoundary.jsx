import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || String(this.state.error || '')
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink mb-4">
            页面渲染出错
          </h1>
          <p className="text-ink-light mb-6 max-w-md mx-auto break-all">
            抱歉，页面遇到了一个错误，请尝试刷新。
          </p>
          {msg && (
            <details className="mb-6 max-w-md mx-auto text-left">
              <summary className="text-xs text-ink-muted cursor-pointer hover:text-ink-light transition-colors select-none">
                错误详情
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-paper-dark border border-rule rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono">
                {msg}
              </pre>
            </details>
          )}
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
