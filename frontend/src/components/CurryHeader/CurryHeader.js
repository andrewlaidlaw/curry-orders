import React from 'react';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
} from '@carbon/react';
import { Notification, UserAvatar } from '@carbon/react/icons';
import { Link } from 'react-router-dom';
import sedoslogo from '../../sedoslogo.png';

const CurryHeader = (props) => (
  <HeaderContainer
    render={({ isSideNavExpanded, onClickSideNavExpand }) => (
      <Header aria-label="Curry Ordering">
        <SkipToContent />
        <HeaderMenuButton
          aria-label="Open menu"
          onClick={onClickSideNavExpand}
          isActive={isSideNavExpanded}
        />
        <HeaderName as={Link} to="/" prefix="">
          <img aria-label="sedos logo" src={sedoslogo}/> &nbsp; Curry Ordering
        </HeaderName>
        <HeaderNavigation aria-label="Order your food">
          <HeaderMenuItem as={Link} to="/">Order your food {props.userName ? '[' + props.userName + ']' : ''}</HeaderMenuItem>
        </HeaderNavigation>
        <HeaderNavigation aria-label="Current orders">
          <HeaderMenuItem as={Link} to="/current">Current orders</HeaderMenuItem>
        </HeaderNavigation>
        <SideNav
          aria-label="Side navigation"
          expanded={isSideNavExpanded}
          isPersistent={false}
        >
          <SideNavItems>
            <HeaderSideNavItems aria-label="Current orders">
              <HeaderMenuItem as={Link} to="/current">Current orders</HeaderMenuItem>
            </HeaderSideNavItems>
          </SideNavItems>
        </SideNav>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="Logout" tooltipAlignment="end">
            <a href="/">
            <UserAvatar size={20} />
            </a>
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
    )}
  />
);

export default CurryHeader;