import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders the dashboard without crashing', () => {
    render(<App />);
    expect(screen.getByText(/prayer dashboard/i)).toBeInTheDocument();
  });
});
