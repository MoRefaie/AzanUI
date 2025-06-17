import { render, screen } from '@testing-library/react';
import NotFound from '../src/pages/NotFound';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('NotFound', () => {
  it('renders 404 page', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
  });
});
