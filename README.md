# react-router-history-context

The `HistoryContext` provided by this package tracks the navigation history within a web application. The primary use-case is having back/forward navigation buttons in an application that are to be disabled/enabled according to the navigation history tracked within the application. For example, a user might have visited external pages before navigating to the application the `HistoryContext` is used in, which the application-internal back button should not offer navigating back to, while it's of course possible using the browsers navigation buttons though.

## Usage

Apply the `<HistoryContextProvider/>` to your application as descendant of your `Router` component and extract the information using `useHistoryContext`, for example:

```javascript
import {BrowserRouter} from 'react-router-dom';
import {HistoryContextProvider} from 'react-router-history-context';
...

function App() {
  return (
    <BrowserRouter>
      <HistoryContextProvider>
        ...
        <BackButton/>
        ...
      </HistoryContextProvider>
    </BrowserRouter>
  )
}
```

```javascript
import {useHistoryContext} from 'react-router-history-context';
import {useNavigate} from 'react-router-dom';

function BackButton() {
  const {canGoBack} = useHistoryContext();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (canGoBack) {
      navigate(-1);
    }
  }, [canGoBack, navigate]);

  return <BackArrow disable={!canGoBack} onClick={handleClick}/>
}
```

Please note this package is intended to work with React Router 6, which is a peer dependency of this package. It will not work with prior versions.

## Implementation

The history within the application is tracked using `sessionStorage`, where the history stack is stored along with the index of the position in the current stack.