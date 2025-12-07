import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { ScannerScreen } from '../screens/Scanner/ScannerScreen';
import { InventaireScreen } from '../screens/Inventaire/InventaireScreen';
import { ReceptionScreen } from '../screens/Reception/ReceptionScreen';
import { AlertesScreen } from '../screens/Alertes/AlertesScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#006bb3',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Tableau de bord',
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <Icon name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventaire"
        component={InventaireScreen}
        options={{
          tabBarLabel: 'Inventaire',
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reception"
        component={ReceptionScreen}
        options={{
          tabBarLabel: 'Réception',
          tabBarIcon: ({ color, size }) => (
            <Icon name="package-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alertes"
        component={AlertesScreen}
        options={{
          tabBarLabel: 'Alertes',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell-alert" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}
