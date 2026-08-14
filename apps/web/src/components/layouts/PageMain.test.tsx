import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { PageMain } from './PageMain';

describe('PageMain', () => {
  it('forwards its ref and applies the selected content width', () => {
    const ref = createRef<HTMLElement>();

    render(
      <PageMain className="custom-main" ref={ref} size="narrow">
        Page content
      </PageMain>,
    );

    const main = screen.getByRole('main');

    expect(ref.current).toBe(main);
    expect(main).toHaveClass('max-w-4xl', 'custom-main');
    expect(main).toHaveTextContent('Page content');
  });

  it('uses the default content width when no size is selected', () => {
    render(<PageMain>Page content</PageMain>);

    expect(screen.getByRole('main')).toHaveClass('max-w-5xl');
  });
});
