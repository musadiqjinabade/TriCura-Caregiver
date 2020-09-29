import React from "react";
import { SafeAreaView, StatusBar } from 'react-native';
import { connect } from "react-redux";
import LoadingIndicator from './core/components/LoadingIndicator';
import DashboardScreen from './home/DashboardScreen';
import { getUserData } from "./store/actions/userActions";
import LoginScreen from './home/LoginScreen';
import styles from './styles/Common';
import TabManager from "./home/TabManager";

class InitialScreen extends React.Component {

    state = {
        loading: true
    }

    componentDidMount() {
        this.setState({
            loading: true
        }, async () => {
            await this.props.getUserData();
            this.setState({
                loading: false
            })
        })
    }

    getScreen() {
        console.log('user = ', this.props.data);
        if (this.state.loading) {
            return <LoadingIndicator />
        }
        else {
            if (this.props.data && this.props.data.access_token) {
                return <TabManager />
            }
            else {
                return <LoginScreen />
            }
        }
    }

    render() {
        return (
            <SafeAreaView style={[styles.full]}>
                <StatusBar backgroundColor={'#000000'} barStyle='default' />
                {this.getScreen()}
            </SafeAreaView>
        );
    }
}

const mapStateToProps = state => ({
    data: state.user.data
});

const mapDispatchToProps = dispatch => ({
    getUserData: () => dispatch(getUserData()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InitialScreen);