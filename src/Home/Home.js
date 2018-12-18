import React, {Component} from 'react';

import Button from '@material-ui/core/Button'

class Home extends Component {
  login() {
    this.props.auth.login();
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <div className="container">
        {
          isAuthenticated() && (
              <h4>
                You are logged in!
              </h4>
            )
        }
        { 
          !isAuthenticated() && (
              <h4>
                You are not logged in! 
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.login.bind(this)}
                >
                  Please Log In
                </Button>
                {' '}to continue.
              </h4>
            )
        }
      </div>
    );
  }
}

export default Home;