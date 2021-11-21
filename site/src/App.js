import './reset.scss';
import './App.scss';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onChildAdded, onChildChanged, limitToLast, query, orderByChild, endBefore } from "firebase/database";
import { useEffect, useState } from 'react'
import { DataItem } from './components/data-item';

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
const stockRef = ref(db, '/latestStock')
const last50DataRef = query(dataRef, limitToLast(50))
const lastHourInStock = query(stockRef, limitToLast(50))

function App() {
  const [data, setData] = useState([])
  const [inStockItems, setInStockItems] = useState([])
  const [loading, setLoading] = useState(false)

  const addData = newItems => {
    setData(curData => [...curData, ...newItems])
  }

  const addInStock = newItems => {
    setInStockItems(curData => [...curData, ...newItems])
  }

  const replaceData = dataItem => {
    setData(curData => {
      const copy = [...curData]
      copy[copy.findIndex(cd => cd.key === dataItem.key)] = dataItem
      return copy
    })
  }

  const replaceInStock = dataItem => {
    setInStockItems(curData => {
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
    setLoading(true)
    onChildAdded(last50DataRef, (snapshot) => {
      const data = {
        key: snapshot.key,
        ...snapshot.val(),
      }
      setLoading(false)
      addData([data])
    })
    onChildAdded(lastHourInStock, (snapshot) => {
      const data = {
        key: snapshot.key,
        ...snapshot.val(),
      }
      addInStock([data])
    })
    onChildChanged(lastHourInStock, (snapshot) => {
      const data = {
        key: snapshot.key,
        ...snapshot.val(),
      }
      replaceInStock(data)
    })
    onChildChanged(last50DataRef, (snapshot) => {
      const data = {
        key: snapshot.key,
        ...snapshot.val(),
      }
      replaceData(data)
    })
  }, [])

  return (
    <div className="app">
      <h1 className="heading">En stock</h1>
      <div className="data">
        {inStockItems.map(d => ({ ...d, isInStock: true })).map(d => (
          <DataItem dataItem={d} key={d.key} />
        ))}
      </div>
      <h1 className="heading">Latest data</h1>
      <div className="filters">

      </div>
      <div className="data">
        {loading ? 'Recuperando datos...' : data.sort((a, b) => a.date > b.date ? -1 : 1).map(d => (
          <DataItem dataItem={d} key={d.key} />
        ))}
      </div>
    </div>
  );
}

export default App;
