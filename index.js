// spectre is the best!
import './spectre.min.css';
import { Component } from 'preact';
import Router from 'preact-router';
import { Link } from 'preact-router/match';

// TODO -- implement restricted routes
//
// /users/:name
//
// checks if there is a token in sessionStorage and that 'name'
// in the URL matches 'name' in the token. Access granted upon
// success, else 403 (forbidden) is returned.

export default class App extends Component {
   state = {
      name: '',
      password: ''
   }

   handleNameChange = (e) => {
      this.setState({ name: e.target.value });
   }

   handlePasswordChange = (e) => {
      this.setState({ password: e.target.value });
   }

   handleLogin = (e) => {
      e.preventDefault();
      fetch(
         "http://localhost:4040/!loginUser",
         { 
            method: 'POST', 
            body: JSON.stringify({ name: this.state.name, password: this.state.password})
         }
      )
         .then( res => res.json() )
         .then( json => {
            sessionStorage.setItem('token', json.token);
         });
   }

   handleSignup = (e) => {
      e.preventDefault();
      fetch(
         "http://localhost:4040/!newUser",
         {
            method: 'POST',
            body: JSON.stringify({ name: this.state.name, password: this.state.password})
         }
      )
         .then( res => res.json() )
         .then( json => {
            sessionStorage.setItem('token', json.token);
         });
   }
   
   render({}, state) {
      return (
         <div class="container">
            <div class="columns">
               <div class="column col-4 col-mx-auto">

                  <h2 class="text-center">Restricted Routes</h2>

                  <p class="text-center text-gray">
                     Login (or sign up) to save a JSON Web Token to local storage.
                     The token can be used to access the restricted routes.
                  </p>

                  <form class="form-group">

                     <div class="columns">

                        { /* name input */ }
                        <label class="form-label">Name</label>
                        <input class="form-input" type="text" placeholder="e.g. Randy Randleman"
                           value={ this.state.name } 
                           onChange={ this.handleNameChange }
                        />

                        { /* password input */ }
                        <label class="form-label">Password</label>
                        <input class="form-input" type="password" 
                           value={ this.state.password } 
                           onChange={ this.handlePasswordChange }
                        /> 

                        { /* login button */ }
                        <button 
                           class="btn btn-primary column mt-2"
                           onClick={ this.handleLogin }
                        >
                           Login
                        </button>

                        { /* divider */ }
                        <div class="divider-vert" data-content="OR" />

                        { /* sign up button */ }
                        <button 
                           class="btn btn-primary column mt-2"
                           onClick={ this.handleSignup }
                        >
                           Signup
                        </button>

                     </div>

                  </form>

                  <Link href="/open">Unrestricted Route</Link>
                  <Link href="/closed">Restricted Route</Link>

                  <Router>
                     <RestrictedRoute path="/closed" />
                     <UnrestrictedRoute path="/open" />
                  </Router>

               </div>
            </div>
         </div>
      );
   }
}

// FIXME -- this feels hacky
//
// still flashes 'Forbidden' on navigation to route when access is
// granted. This is because it reads the state before the fetch
// promise has resolved. Not sure what the fix is yet.
//
// probably needs higher order component something something.
//
// more (p)react practice...
//
class RestrictedRoute extends Component {
   state = {
      canAccess: false
   }

   componentDidMount () {
      fetch('http://localhost:4040/!checkToken',
         {
            method: 'POST',
            body: JSON.stringify({ token: sessionStorage.getItem('token') })
         }
      )
         .then( res => {
            console.log(res.ok);
            if ( res.ok ) {
               this.setState({ canAccess: true });
            }
         })
   }

   render () {
      if ( this.state.canAccess ) {
         return ( <h1>Welcome to the Restricted Route</h1> )
      } else {
         return ( <h1>Forbidden</h1> )
      }
   }
}

const UnrestrictedRoute = () => (
   <h1>Welcome to the Unrestricted Route</h1>
)
