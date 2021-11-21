import './reset.scss';
import './App.scss';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onChildAdded, onChildChanged } from "firebase/database";
import { useEffect, useState } from 'react'
import { format } from 'timeago.js';

const firebaseConfig = {
  apiKey: "AIzaSyD4XxIuiekhE84uh7_IIVX8Fzf3wXYCcDA",
  authDomain: "price-tracker-1c428.firebaseapp.com",
  databaseURL: "https://price-tracker-1c428.firebaseio.com",
  projectId: "price-tracker-1c428",
  storageBucket: "price-tracker-1c428.appspot.com",
  messagingSenderId: "371469893400",
  appId: "1:371469893400:web:661c8956a419487ddc286d",
  measurementId: "G-GJBMLVW97M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dataRef = ref(db, '/data')

function App() {
  const [data, setData] = useState([])

  const addData = newItems => {
    setData(curData => [...curData, ...newItems])
  }

  const replaceData = dataItem => {
    setData(curData => {
      const copy = [...curData]
      copy[copy.findIndex(cd => cd.key === dataItem.key)] = dataItem
      return copy
    })
  }

  useEffect(() => {
    /* get(dataRef).then(snapshot => {
      const data = Object.values(snapshot.val())
      console.log('get', data);
      setData(data)
    }) */
    onChildAdded(dataRef, (snapshot) => {
      const data = {
        key: snapshot.key,
        ...snapshot.val(),
      }
      console.log('new Child', snapshot.key, data);
      addData([data])
    })
    onChildChanged(dataRef, (snapshot) => {
      const data = {
        key: snapshot.key,
        ...snapshot.val(),
      }
      console.log('updated Child', snapshot.key, data);
      replaceData(data)
    })
  }, [])

  return (
    <div className="app">
      <h1 className="heading">Latest data</h1>
      <div className="data">
        {data.sort((a, b) => a.date > b.date ? -1 : 1).map(d => (
          <div className={`dataItem${d.loading ? ' loading' : d.isInStock ? ' inStock' : ' notInStock'}`} key={d.key}>
            <div className="leftContent">
              <header className="headerContent">
                <span>{d.loading ? <img alt="" className="loadingSpinner" src="loading.svg" /> : d.price ? d.isInStock ? '✔️' : '❌' : '❔'}</span>
                <span className="name">{d.name}</span>
              </header>
              <div className="smallContent">
                <span className="timestamp">{format(new Date(d.date), 'es_ES')}</span>
                <span className="site">- @{d.site}</span>
              </div>
            </div>
            <div className="rightContent">
              <span className="price">{d.price ? d.price : d.loading ? <img alt="" className="loadingSpinner" src="loading.svg" /> : '❔'} EUR</span>
              <a rel="noreferrer" target="_blank" href={d.url} className="visitButton">🔗 Visit</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
