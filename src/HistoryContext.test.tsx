import '@testing-library/jest-dom';
import {BrowserRouter, Link, MemoryRouter, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import React, {MouseEvent, useCallback} from 'react';
import useHistoryContext, {HistoryContextProvider} from './HistoryContext';
import {cleanup, render, waitFor} from "@testing-library/react";

const sessionStorageMock = (() => {
	let store: {[key: string]: string} = {};

	return {
		getItem(key: string) {
			return store[key] || null;
		},
		setItem(key: string, value: string | number) {
			store[key] = value.toString();
		},
		removeItem(key: string) {
			delete store[key];
		},
		clear() {
			store = {};
		}
	};
})();

Object.defineProperty(window, 'sessionStorage', {value: sessionStorageMock});

const Page0 = () => <div>Page 0</div>;
const Page1 = () => <div>Page 1</div>;
const Page2 = () => <div>Page 2</div>;

export default function App() {
	const {canGoBack, canGoForward} = useHistoryContext()
	const navigate = useNavigate();
	const {pathname} = useLocation();

	const onBackClick = useCallback((event: MouseEvent) => {
		event.preventDefault();
		navigate(-1);
	}, [navigate]);

	const onForwardClick = useCallback((event: MouseEvent) => {
		event.preventDefault();
		navigate(1);
	}, [navigate]);

	return (
		<>
			<div>
				Location: {pathname}
			</div>
			<div>
				{canGoBack && <Link to="/" onClick={onBackClick}>back</Link>}
				{canGoForward && <Link to="/" onClick={onForwardClick}>forward</Link>}
				<Link to="/" onClick={() => navigate(-1)}>force back</Link>
			</div>
			<div>
				<Link to="/">Page 0</Link>
				<Link to="/page1">Page 1</Link>
				<Link to="/page2">Page 2</Link>
			</div>
			<Routes>
				<Route path="/" element={<Page0/>}/>
				<Route path="/page1" element={<Page1/>}/>
				<Route path="/page2" element={<Page2/>}/>
			</Routes>
		</>
	);
}

test('Navigation within the tracked context', async() => {
	const {getByText, queryByText} = render(
		<MemoryRouter>
			<HistoryContextProvider>
				<App/>
			</HistoryContextProvider>
		</MemoryRouter>
	);

	expect(getByText('Location: /')).toBeInTheDocument();
	expect(queryByText('back')).toBeNull();
	expect(queryByText('forward')).toBeNull();

	getByText('Page 1').click();

	await waitFor(() => expect(getByText('Location: /page1')).toBeInTheDocument());
	expect(getByText('back')).toBeInTheDocument();
	expect(queryByText('forward')).toBeNull();

	getByText('Page 2').click();

	await waitFor(() => expect(getByText('Location: /page2')).toBeInTheDocument());
	expect(getByText('back')).toBeInTheDocument();
	expect(queryByText('forward')).toBeNull();

	getByText('back').click();

	await waitFor(() => expect(getByText('Location: /page1')).toBeInTheDocument());
	expect(getByText('back')).toBeInTheDocument();
	expect(getByText('forward')).toBeInTheDocument();

	getByText('forward').click();

	await waitFor(() => expect(getByText('Location: /page2')).toBeInTheDocument());
	expect(getByText('back')).toBeInTheDocument();
	expect(queryByText('forward')).toBeNull();

	getByText('back').click();

	await waitFor(() => expect(getByText('Location: /page1')).toBeInTheDocument());

	getByText('back').click();

	await waitFor(() => expect(getByText('Location: /')).toBeInTheDocument());
	expect(queryByText('back')).toBeNull();
	expect(getByText('forward')).toBeInTheDocument();

	getByText('Page 2').click();

	await waitFor(() => expect(getByText('Location: /page2')).toBeInTheDocument());

	getByText('back').click();

	await waitFor(() => expect(getByText('Location: /')).toBeInTheDocument());
	expect(queryByText('back')).toBeNull();
	expect(getByText('forward')).toBeInTheDocument();
});

test('Emulate navigating out of the tracked context', async() => {
	const {queryByText} = render(
		<MemoryRouter>
			<HistoryContextProvider>
				<App/>
			</HistoryContextProvider>
		</MemoryRouter>
	);

	cleanup();

	// React Router triggers a POP action on render. While on the initial page, the key is "default",
	// another key is assigned rendering the Router again triggering the POP actions as if having
	// navigated out of the history tracker context.
	render(
		<MemoryRouter initialEntries={['/some-route', '/']}>
			<HistoryContextProvider>
				<App/>
			</HistoryContextProvider>
		</MemoryRouter>
	);

	expect(JSON.parse(sessionStorage.getItem('history_stack') || '').length).toBe(1);
	expect(queryByText('back')).toBeNull();
	expect(queryByText('forward')).toBeNull();
});

test('Throw error when out of context', async() => {
	console.error = jest.fn();

	expect(() => render(<BrowserRouter><App/></BrowserRouter>)).toThrow();
});