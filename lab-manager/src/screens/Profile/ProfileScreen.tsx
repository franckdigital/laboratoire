import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Avatar, Button, List, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={`${user?.first_name?.charAt(0)}${user?.last_name?.charAt(0)}`}
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email}
        </Text>
        <Text variant="bodySmall" style={styles.role}>
          Rôle: {user?.role}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Informations" />
        <Card.Content>
          <List.Item
            title="Email"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Rôle"
            description={user?.role}
            left={(props) => <List.Icon {...props} icon="account-key" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Application" />
        <Card.Content>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="À propos"
            description="Lab Manager - LANEMA"
            left={(props) => <List.Icon {...props} icon="cellphone" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          icon="logout"
          style={styles.logoutButton}
          buttonColor="#DC2626"
        >
          Se déconnecter
        </Button>
      </View>

      <Text variant="bodySmall" style={styles.footer}>
        © 2025 LANEMA - Tous droits réservés
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    backgroundColor: '#006bb3',
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  email: {
    color: '#6B7280',
    marginTop: 4,
  },
  role: {
    color: '#9CA3AF',
    marginTop: 8,
  },
  card: {
    margin: 12,
    elevation: 2,
  },
  buttonContainer: {
    padding: 12,
  },
  logoutButton: {
    marginVertical: 8,
  },
  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    padding: 24,
  },
});
