import { useAuth } from '@/src/context/AuthContext';
import { devisAPI, notificationsAPI } from '@/src/services/api';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export function DashboardClientScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_demandes: 0, en_attente: 0, en_cours: 0, acceptees: 0 });
  const [notifStats, setNotifStats] = useState({ total: 0, non_lues: 0, aujourd_hui: 0, alertes: 0 });

  const load = async () => {
    try {
      const [s, ns] = await Promise.all([devisAPI.stats(), notificationsAPI.stats()]);
      setStats(s);
      setNotifStats(ns);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Dashboard client load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Tableau de bord
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Bonjour, {user?.first_name} {user?.last_name}
        </Text>
      </View>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">{loading ? '...' : stats.total_demandes}</Text>
            <Text variant="bodySmall">Demandes totales</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">{loading ? '...' : stats.en_attente}</Text>
            <Text variant="bodySmall">En attente</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">{loading ? '...' : stats.en_cours}</Text>
            <Text variant="bodySmall">En cours</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">{loading ? '...' : stats.acceptees}</Text>
            <Text variant="bodySmall">Acceptées</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.block}>
        <Card.Title title="Notifications" />
        <Card.Content>
          <Text variant="bodyMedium">Non lues: {loading ? '...' : notifStats.non_lues}</Text>
          <Text variant="bodyMedium">Aujourd'hui: {loading ? '...' : notifStats.aujourd_hui}</Text>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 12 },
  card: { width: '47%' },
  block: { margin: 12 },
});
