import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';

class AuthPage extends Component {
	state = {
		isLogin: true
	};

	static contextType = AuthContext;

	constructor(props) {
		super(props);
		this.emailEl = React.createRef();
		this.passwordEl = React.createRef();
	}

	switchModeHandler = () => {
		this.setState(prevState => {
			return { isLogin: !prevState.isLogin };
		});
	};

	submitHandler = event => {
		event.preventDefault();
		const email = this.emailEl.current.value;
		const password = this.passwordEl.current.value;

		if (email.trim().length === 0 || password.trim().length === 0) {
			return;
		}

		let requestBody = {
			query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
			variables: {
				email: email,
				password: password
			}
		};

		if (!this.state.isLogin) {
			requestBody = {
				query: `
          mutation CreateUser($email: String!, $password: String!) {
            createUser(userInput: {email: $email, password: $password}) {
              _id
              email
            }
          }
        `,
				variables: {
					email: email,
					password: password
				}
			};
		}

		// fetch('http://localhost:8000/graphql', {
		fetch('https://nodejs-react-graphql.herokuapp.com/graphql', {
			method: 'POST',
			body: JSON.stringify(requestBody),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed!');
				}
				return res.json();
			})
			.then(resData => {
				if (resData.data.login.token) {
					this.context.login(
						resData.data.login.token,
						resData.data.login.userId,
						resData.data.login.tokenExpiration
					);
				}
			})
			.catch(err => {
				console.log(err);
			});
	};

	render() {
		return (
			<div className="wrapper-page">
				<div className="card card-pages">
					<div className="card-header bg-img">
						<div className="bg-overlay"></div>
						<h3 className="text-center m-t-10 text-white"> Sign In to <strong>EventZilla</strong> </h3>
					</div>

					<div className="card-body">
						<form className="form-horizontal m-t-20" onSubmit={this.submitHandler}>


							{/* <div className="form-control">
						<label htmlFor="email">E-Mail</label>
						<input type="email" id="email" ref={this.emailEl} />
					</div>
					<div className="form-control">
						<label htmlFor="password">Password</label>
						<input type="password" id="password" ref={this.passwordEl} />
					</div>
					<div className="form-actions">
						<button type="submit">Submit</button>
						<button type="button" onClick={this.switchModeHandler}>
							Switch to {this.state.isLogin ? 'Signup' : 'Login'}
						</button>
					</div> */}


							<div className="form-group">
								<div className="col-12">
									<input className="form-control input-lg" type="text" required="" placeholder="Username" id="email" ref={this.emailEl} />
								</div>
							</div>

							<div className="form-group">
								<div className="col-12">
									<input className="form-control input-lg" type="password" required="" placeholder="Password" id="password" ref={this.passwordEl} />
								</div>
							</div>

							{/* <div className="form-group">
								<div className="col-12">
									<div className="checkbox checkbox-primary">
										<input id="checkbox-signup" type="checkbox" />
										<label for="checkbox-signup">Remember me</label>
									</div>
								</div>
							</div> */}

							<div className="form-group text-center m-t-40">
								<div className="col-12">
									<button className="btn btn-primary btn-lg w-lg waves-effect waves-light" type="submit">Log In</button>
								</div>
							</div>

							<div className="form-group row m-t-30">
								<div className="col-sm-7">
									<a href="{this.switchModeHandler}"><i className="fa fa-lock m-r-5"></i> Forgot your password?</a>
								</div>
								<div className="col-sm-5 text-right">
									<a href="javascript:0;" onClick={this.switchModeHandler} >Switch to {this.state.isLogin ? 'Signup' : 'Login'}</a>
								</div>
							</div>

							{/* <div className="form-actions">
								<button type="button" onClick={this.switchModeHandler}>
									Switch to {this.state.isLogin ? 'Signup' : 'Login'}
								</button>
							</div> */}

						</form>
					</div>

				</div>
			</div>
		);
	}
}

export default AuthPage;
