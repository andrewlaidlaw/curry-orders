import React from 'react';

import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App';
import { HashRouter as Router } from 'react-router-dom';
// import * as serviceWorker from './serviceWorker';

// ReactDOM.render( 
//     <Router>
//       <App />
//     </Router>
//   , document.getElementById('root'));

  createRoot(document.getElementById('root')).render(
    <Router>
      <App/>
    </Router>
  );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();