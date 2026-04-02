import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-wrapper animate-fade">
          {children}
        </div>
      </div>
    </div>
  )
}
