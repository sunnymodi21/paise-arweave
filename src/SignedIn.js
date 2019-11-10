import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import NavBar from './NavBar'
import MyExpense from './MyExpense'
import './SignedIn.css'


class SignedIn extends Component {

  constructor(props) {
    super(props)
    this.signOut = this.signOut.bind(this)
  }

  signOut(e) {
    e.preventDefault()
    window.location = '/'+window.location.pathname.split('/')[1]
  }

  render() {
    const userKey  = this.props.userKey;
    if(window.location.pathname === '/') {
      return (
        <Redirect to={window.location.pathname.split('/')[1]+'/myexpense'} />
      )
    }

    return (
      <div className="component">
      <NavBar signOut={this.signOut}/>
      <Switch>
              <Route
                to={window.location.pathname.split('/')[1]+'/myexpense'}
                render={
                  routeProps => <MyExpense
                  protocol={window.location.protocol}
                  userKey={userKey}
                  realm={window.location.origin.split('//')[1]}
                  {...routeProps} />
                }
              />
      </Switch>
      </div>
    );
  }
}

export default SignedIn
