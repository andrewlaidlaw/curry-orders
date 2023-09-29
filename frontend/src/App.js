import React, { Component } from 'react';
import './App.scss';
import { Theme, Content, InlineNotification, Button } from '@carbon/react';
import { Route, Switch, BrowserRouter} from 'react-router-dom';
import CurrentOrders from './content/CurrentOrders/CurrentOrders';
import OrderPage from './content/OrderPage/OrderPage';
import CurryHeader from './components/CurryHeader/CurryHeader';
import LoginPage from './content/LoginPage/LoginPage';
import AppID from 'ibmcloud-appid-js';

function App() {

  const orderapiurl = process.env.REACT_APP_ORDER_API;
  const menuapiurl = process.env.REACT_APP_MENU_API;
  const appIDclientID = process.env.REACT_APP_CLIENTID;
  const appIDendpoint = process.env.REACT_APP_ENDPOINT;

  const appID = React.useMemo(() => {
    return new AppID()
  }, [])

  const [errorState, setErrorState] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  (async () => {
      try {
        await appID.init({
          // clientId: '67188d25-a588-440e-8e41-bc80ce771a99',
          clientId: appIDclientID,
          // discoveryEndpoint: 'https://eu-gb.appid.cloud.ibm.com/oauth/v4/57371683-abe3-4f43-bd78-656158df5c61/.well-known/openid-configuration'
          discoveryEndpoint: appIDendpoint
        });
      } catch (e) {
        setErrorState(true);
        setErrorMessage(e.message);
      }
    })();

  const [welcomeDisplayState, setWelcomeDisplayState] = React.useState(false);
  const [loginButtonDisplayState, setLoginButtonDisplayState] = React.useState(true);
  const [userName, setUserName] = React.useState('');
  const [userSub, setUserSub] = React.useState('');
  const [orderExists, setOrderExists] = React.useState(false);

  const loginAction = async () => {
    var orderid='';
    var name='';
    try {
      const tokens = await appID.signin();
      setErrorState(false);
      setLoginButtonDisplayState(false);
      setWelcomeDisplayState(true);
      setUserName(tokens.idTokenPayload.name);
      setUserSub(tokens.idTokenPayload.sub);
      orderid = await tokens.idTokenPayload.sub;
      name = await tokens.idTokenPayload.name;
    } catch (e) {
      setErrorState(true);
      setErrorMessage(e.message);
    } finally {
      const checked = await orderExistCheck(orderid, name);
    }
  };

  const orderExistCheck = async (userSub, userName) => {
    var data = await fetch(orderapiurl + '/order/findorder/byid/' + userSub)
                .catch(console.error);
    var json = await data.json();
    if (json.notfound) {
      console.log("Need to create order")
      await fetch(orderapiurl + '/order/neworder/' + userSub + '/' + userName)
    } else {
      console.log('Order found: ' + userSub)
    }
    setOrderExists(true);
    return(true);
  }

  return (
      <BrowserRouter>
      <Theme theme='g100'>
        <CurryHeader userName={userName}/>
      </Theme>
        <Content>
          <Switch>
          {welcomeDisplayState && <Route exact path="/" render={(props) => <OrderPage  userName={userName} userSub={userSub} isAuthed={true} menuapiurl={menuapiurl}/>}/>}
          {welcomeDisplayState && <Route path="/current" render={(props) => <CurrentOrders userName={userName} isAuthed={true} orderapiurl={orderapiurl}/>} />}
          {loginButtonDisplayState && <Route path="/" render={(props) => <LoginPage loginAction={loginAction} />}/>}
          {/* {loginButtonDisplayState && <Button id='login' onClick={loginAction}>Login</Button>} */}
          {errorState && <InlineNotification caption={errorMessage} hideCloseButton kind='error' title='Error'/>}
          </Switch>
        </Content>
      </BrowserRouter>
    );
  }

export default App;