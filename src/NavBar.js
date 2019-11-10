import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './NavBar.css'

class NavBar extends Component {

  render() {
    return (
      <nav className="navbar navbar-expand-md navbar-light bg-blue fixed-top">
      <div className="navbar-brand" to="/">Paise</div>

      <div className="collapse navbar-collapse" id="navbarsExampleDefault">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            {/* <Link className="nav-link" to={window.location.pathname.split('/')[1]+'/myexpense'}>Expense</Link> */}
          </li>
        </ul>
      </div>
      <button
        className="btn btn-primary"
        onClick={this.props.signOut.bind(this)}
      >Sign out
      </button>
      </nav>
    )
  }
}

export default NavBar
