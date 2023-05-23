import {NavigationType} from 'react-router-dom';

const SESSION_STORAGE_PREFIX = 'history_';

type State = {
	key: string
	pathname: string
}

class HistoryTracker {

	private currentIndex = 0;
	private historyStack: State[] = [];

	constructor() {
		this.loadFromSession();
	}

	canGoBack(n = 1): boolean {
		return this.currentIndex >= n;
	}

	canGoForward(n = 1): boolean {
		return this.currentIndex < (this.historyStack.length - n);
	}

	onHistoryEvent({pathname, key}: State, action: NavigationType): void {
		if (this.historyStack.length === 0) {
			this.historyStack.push({key, pathname});
			this.saveToSession();
			return;
		}

		if (action === 'PUSH') {
			if (this.canGoForward()) {
				this.historyStack = this.historyStack.splice(0, this.currentIndex + 1);
			}

			this.historyStack.push({key, pathname});
			this.currentIndex++;
		}

		if (action === 'POP') {
			const newIndex = this.historyStack.findIndex(i => i.key === key);

			if (newIndex === -1) {
				// User navigates using the browser's back button
				this.historyStack = [{key, pathname}];
				this.currentIndex = 0;
			} else {
				this.currentIndex = newIndex;
			}
		}

		this.saveToSession();
	}

	private loadFromSession(): void {
		this.historyStack = JSON.parse(
			sessionStorage.getItem(SESSION_STORAGE_PREFIX + 'stack') || 'null'
		) || [];
		this.currentIndex = parseInt(
			sessionStorage.getItem(SESSION_STORAGE_PREFIX + 'index') || ''
		) || 0;
	}

	private saveToSession(): void {
		sessionStorage.setItem(SESSION_STORAGE_PREFIX + 'stack', JSON.stringify(this.historyStack));
		sessionStorage.setItem(SESSION_STORAGE_PREFIX + 'index', this.currentIndex.toString());
	}
}

const historyTracker = new HistoryTracker();

export default historyTracker;