// spectre is the best!
import './spectre.min.css';
import { Component } from 'preact';
import Router from 'preact-router';
import { Link } from 'preact-router/match';

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

                  <Link class="d-block" href="/open">Unrestricted Route</Link>
                  <Link class="d-block" href="/closed">Restricted Route</Link>
                  <Link class="d-block" href="/closed-hoc">Restricted Route (HOC)</Link>

                  <Router>
                     <RestrictedRoute path="/closed" />
                     <RestrictedRouteWithAuth path="/closed-hoc" />
                     <UnrestrictedRoute path="/open" />
                     <Profile path="/profile/:name" />
                  </Router>

               </div>
            </div>
         </div>
      );
   }
}
//
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
      loading: true,
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
            this.setState({ loading: false });
            if ( res.ok ) {
               this.setState({ canAccess: true });
            }
         })
   }

   render () {
      if ( this.state.loading ) {
         return ( <h1 class="text-center text-gray">Loading...</h1> )
      } else if ( this.state.canAccess ) {
         return ( <h1 class="text-center">Welcome to the Restricted Route</h1> )
      } else {
         return ( <h1 class="text-center">Access Denied</h1> )
      }
   }
}

const withAuth = ComposedComponent => 
   class extends Component {
      state = {
         loading: true,
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
               this.setState({ loading: false });
               if ( res.ok ) {
                  this.setState({ canAccess: true });
               }
            })
      }

      render ( {name}, state ) {
         if ( this.state.loading ) {
            return ( <h1 class="text-center text-gray">Loading...</h1> )
         } else if ( this.state.canAccess ) {
            return ( <ComposedComponent />)
         } else {
            return ( <h1 class="text-center">Access Denied</h1> )
         }
      }
   }

const RestrictedRouteText = () => (
   <h1>Welcome to the Restricted Route, served from a higher order component!</h1>
)

const RestrictedRouteWithAuth = withAuth(RestrictedRouteText);

const UnrestrictedRoute = () => (
   <h1>Welcome to the Unrestricted Route</h1>
)

// so much repeated code, needs HOC
class Profile extends Component {
   state = {
      loading: true,
      canAccess: false
   }

   componentDidMount () {
      fetch('http://localhost:4040/!accessProfile?' + this.props.name,
         {
            method: 'POST',
            body: JSON.stringify({ token: sessionStorage.getItem('token') })
         }
      )
         .then( res => {
            this.setState({ loading: false });
            if ( res.ok ) {
               this.setState({ canAccess: true });
            }
         })
   }

   // name comes from the router
   render ( {name}, state ) {
      if ( this.state.loading ) {
         return ( <h1 class="text-center text-gray">Loading...</h1> )
      } else if ( this.state.canAccess ) {
         return ( <h1 class="text-center">Welcome { name }!</h1> )
      } else {
         return ( <h1 class="text-center">Access Denied</h1> )
      }
   }
}
