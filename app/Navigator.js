import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import SplashScreen from './home/SplashScreen';
import LoginScreen from './home/LoginScreen';
import DashboardScreen from './home/DashboardScreen';
import HelpScreen from './profile/HelpScreen';
import CurrentShift from './shift/CurrentShift';
import ShowShiftDetails from './shift/ShowShiftDetails'
import InitialScreen from './InitialScreen';
import ShiftPhotoScreen from './shift/ShiftPhotoScreen';
import ShowShiftPhoto from './shift/ShowShiftPhoto';
import MyAccountScreen from './profile/MyAccountScreen';
import CurrentPayrollScreen from './shift/CurrentPayrollScreen';
import MyCalendarScreen from './shift/MyCalendarScreen';
import NotificationScreen from './Notification/NotificationScreen';
import Immediateshift from './Notification/Immediateshift';
import ShiftChanged from'./Notification/ShiftChanged';
import JobsScreen from './shift/JobsScreen';
import TabManager from './home/TabManager';
import ProfileScreen from './profile/ProfileScreen';
import AgencyInfoScreen from './profile/AgencyInfoScreen';
import CommunicationScreen from './transaction/CommunicationScreen';
import ForgotPasswordScreen from './home/ForgotPasswordScreen';
import ShiftHistoryScreen from './shift/ShiftHistoryScreen';
import ChangePasswordScreen from './profile/ChangePasswordScreen';
import ExtraExpenses from './shift/ExtraExpenses/ExtraExpenses';
import ShowExtraExpenses from './shift/ExtraExpenses/ShowExtraExpenses'
import Task from './shift/Task/Task';
import ShowTask from './shift/Task/ShowTask';
import Notes from './shift/Notes/Notes';
import Caregivers from './shift/Previous_Caregiver/Caregivers';
import PayrollSession from './shift/PayrollSession';
import EditInterestMatching from './profile/ProfileTabs/EditInterestMatching';
import ShiftUnavailability from './shift/ShiftUnavailability';
import Shift from './shift/Shift';
import Upcoming from './shift/Upcoming';
import Acknowledge from './shift/JobsTab/Acknowledge';
import Applyshift from './shift/JobsTab/Applyshift';
import Covid19 from './shift/Covid19'
import ClientProfile from './shift/Client/ClientProfile';
import Assessment from './shift/Client/Assessment';
import CaregiverNotes from './shift/Client/CaregiverNotes'


const Navigator = createStackNavigator(
    {
        InitialScreen,
        SplashScreen,
        LoginScreen,
        DashboardScreen,
        HelpScreen,
        CurrentShift,
        ShiftPhotoScreen,
        MyAccountScreen,
        CurrentPayrollScreen,
        MyCalendarScreen,
        NotificationScreen,
        JobsScreen,
        TabManager,
        ProfileScreen,
        AgencyInfoScreen,
        CommunicationScreen,
        ForgotPasswordScreen,
        ShiftHistoryScreen,
        ChangePasswordScreen,
        ExtraExpenses,
        ShowExtraExpenses,
        Task,
        ShowTask,
        Notes,
        Caregivers,
        PayrollSession,
        EditInterestMatching,
        ShiftUnavailability,
        ShowShiftDetails,
        Immediateshift,
        ShiftChanged,
        ShowShiftPhoto,
        Shift,
        Upcoming,
        Acknowledge,
        Applyshift,
        Covid19,
        ClientProfile,
        Assessment,
        CaregiverNotes
    },
    {
        initialRouteName: 'SplashScreen',
        defaultNavigationOptions: {
            header: null
        }
    }
);

export default createAppContainer(Navigator);