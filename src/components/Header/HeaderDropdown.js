import React, {Component} from 'react'

import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from 'reactstrap'
import connect from 'react-redux/es/connect/connect'
import {impersonateUserAction, logout} from '../../actions/AppActions'
import {toastAlerts} from '../../views/Shared/toast_alert'

class HeaderDropdown extends Component {

    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.profileLink = this.profileLink.bind(this);

        this.state = {
            dropdownOpen: false,
            activeUserInfo: this.props.userInfo
        }
    }

    componentWillReceiveProps(props) {
        if (props.userInfo !== undefined) {
            this.setState({
                activeUserInfo: props.userInfo,
            })
        }
    }

    profileLink() {
        window.location = '#/profile'
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        })
    }

    render() {
        return (
            <UncontrolledDropdown nav>
                <DropdownToggle nav>
                    <img src={this.state.activeUserInfo.picture} className="img-avatar" alt=""/>
                </DropdownToggle>
                <DropdownMenu right>
                    <DropdownItem header className="text-center">
                        <strong>{this.state.activeUserInfo.username}</strong>
                    </DropdownItem>
                    <DropdownItem onClick={this.profileLink}><i className="fa fa-user"/>{'حساب کاربری'}
                    </DropdownItem>
                    {this.state.activeUserInfo.impersonated ?
                        <DropdownItem onClick={() => this.props.dispatch(impersonateUserAction(0, 0, toastAlerts))}>
                            <i className="fa fa-power-off"/>{'خروج از حالت شخص سوم'}
                        </DropdownItem> : ''}
                    <DropdownItem onClick={() => this.props.dispatch(logout())}><i
    className="fa fa-lock"/>خروج</DropdownItem>
                </DropdownMenu>
            </UncontrolledDropdown>
        )
    }
}

function mapStateToProps(state) {
    return {
        userInfo: state.userReducer,
    }
}

export default connect(mapStateToProps)(HeaderDropdown)
