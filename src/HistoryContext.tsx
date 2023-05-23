import {ReactNode, createContext, useContext, useEffect, useState} from 'react';
import HistoryTracker from './HistoryTracker';
import {useLocation, useNavigationType} from 'react-router-dom';

interface HistoryContextType {
	canGoBack: boolean
	canGoForward: boolean
}

const HistoryContext = createContext<HistoryContextType | null>(null);

type Props = {
	children?: ReactNode
}

export const HistoryContextProvider = ({children}: Props) => {
	const {key, pathname} = useLocation();
	const action = useNavigationType();
	const [canGoBack, setCanGoBack] = useState(false);
	const [canGoForward, setCanGoForward] = useState(false);

	useEffect(() => {
		HistoryTracker.onHistoryEvent({pathname, key}, action);

		setCanGoBack(HistoryTracker.canGoBack());
		setCanGoForward(HistoryTracker.canGoForward());
	}, [action, key, pathname]);

	return (
		<HistoryContext.Provider value={{canGoBack, canGoForward}}>
			{children}
		</HistoryContext.Provider>
	);
};

export default function useHistoryContext() {
	const context = useContext(HistoryContext);

	if (!context) {
		throw new Error('useHistoryContext cannot be used outside a HistoryContext');
	}

	return context;
}