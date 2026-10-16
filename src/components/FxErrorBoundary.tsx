import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { failed: boolean; }

/** Optional animation failures must never blank the game or block play. */
export class FxErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Error is isolated here; the original 2D/emoji fallback remains visible.
  }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children; }
}
