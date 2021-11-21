import { format } from "timeago.js";
import "./data-item.scss"

export function DataItem({ dataItem }) {
  return (
    <div className={`dataItem${dataItem.loading ? ' loading' : dataItem.isInStock ? ' inStock' : ' notInStock'}`} key={dataItem.key}>
      <div className="leftContent">
        <header className="headerContent">
          <span>{dataItem.loading ? <img alt="" className="loadingSpinner" src="loading.svg" /> : dataItem.productPrice ? dataItem.isInStock ? '✔️' : '❌' : '❔'}</span>
          <span className="name">{dataItem.productName}</span>
        </header>
        <div className="smallContent">
          <span className="timestamp">{format(new Date(dataItem.date), 'es_ES')}</span>
          <span className="site">- @{dataItem.productSite}</span>
        </div>
      </div>
      <div className="rightContent">
        <span className="price">{dataItem.productPrice ? dataItem.productPrice : dataItem.loading ? <img alt="" className="loadingSpinner" src="loading.svg" /> : '❔'} EUR</span>
        <a rel="noreferrer" target="_blank" href={dataItem.productUrl} className="visitButton">🔗 Visit</a>
      </div>
    </div>
  )
}