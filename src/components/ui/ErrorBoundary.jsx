import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
          <div className="glass rounded-2xl p-8 max-w-md text-center">
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="text-xl font-bold text-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Something went wrong</h1>
            <p className="text-sm text-text-muted mb-4">An unexpected error occurred. Please try refreshing the page.</p>
            <button onClick={() => window.location.href = '/'} className="btn-gold text-sm px-6 py-2">
              Go Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
