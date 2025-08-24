import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { render } from '@testing-library/react';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
  });
});
