import { render, screen } from '@testing-library/react';
import { RegisterView } from '../components/View/RegisterView';
import '@testing-library/jest-dom';

describe('Register Button', () => {
    it('should render the element with a child inside', () => {
        render(<RegisterView view={{}} />);
    });
});
