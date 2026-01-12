import { useAuth } from '@/src/context/AuthContext';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Divider, List, Text } from 'react-native-paper';

export function ProfilClientScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={`${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`}
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Informations" />
        <Card.Content>
          <List.Item title="Email" description={user?.email} left={(props) => <List.Icon {...props} icon="email" />} />
          <Divider />
          <List.Item title="Rôle" description={user?.role} left={(props) => <List.Icon {...props} icon="account-key" />} />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={() => signOut()} icon="logout" buttonColor="#DC2626">
          Se déconnecter
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 24, backgroundColor: '#FFFFFF', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  avatar: { backgroundColor: '#006bb3', marginBottom: 16 },
  name: { fontWeight: 'bold', color: '#1F2937' },
  email: { color: '#6B7280', marginTop: 4 },
  card: { margin: 12 },
  buttonContainer: { padding: 12 },
});
