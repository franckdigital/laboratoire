import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export function EchantillonsClientScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Échantillons
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          À implémenter (parité avec laboratoire-public)
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium">
            Cet écran sera connecté aux endpoints échantillons lorsque le module mobile sera prêt.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontWeight: 'bold', color: '#1F2937' },
  subtitle: { color: '#6B7280', marginTop: 4 },
  card: { margin: 12 },
});
