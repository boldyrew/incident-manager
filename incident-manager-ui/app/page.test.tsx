import { redirect } from 'next/navigation';
import Home from './page';

jest.mock('next/navigation', () => ({ redirect: jest.fn() }));

describe('Home', () => {
  it('redirects to the incidents page', () => {
    Home();
    expect(redirect).toHaveBeenCalledWith('/incidents');
  });
});
