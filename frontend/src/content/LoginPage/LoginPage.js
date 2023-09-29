import React from 'react';
import { Grid, Column, Button } from '@carbon/react';

const LoginPage = (props) => {
    return(

        <Grid className="order-page" fullWidth>
          <Column lg={16} md={8} sm={4} className="order-page__banner">
            <Grid className='order-page' fullWidth>
            <Column lg={8} md={4} sm={4} className="order-page__intro">
            <h1 className='order-page__heading'>Curry Ordering</h1>
            <p>You will need to login to the service using either Facebook, Google, IBMid, or sign up with an e-mail address. You can then select the combination of delicious things that will keep you happy late on a Thursday evening.</p>
            </Column>
            </Grid><Grid className='order-page__button'>
            <Column lg={8} md={4} sm={4} className='login-page__button'>
                <Button id='login' onClick={props.loginAction}>Login</Button>
            </Column>
          </Grid>
          </Column>
          <Column lg={16} md={8} sm={4} className="order-page__r2">
          </Column>
        </Grid>
        
    )
};

export default LoginPage;