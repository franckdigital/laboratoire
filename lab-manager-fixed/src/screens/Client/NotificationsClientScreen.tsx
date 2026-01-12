import { notificationsAPI } from '@/src/services/api';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export function NotificationsClientScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    try {
      const data = await notificationsAPI.list({ lu: 'false' });
      setItems(data?.results || data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Notifications load error:', e);
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
          Notifications
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {loading ? 'Chargement...' : `${items.length} non lue(s)`}
        </Text>
      </View>

      <View style={styles.list}>
        {items.length === 0 && !loading ? (
          <Text style={styles.empty}>Aucune notification</Text>
        ) : (
          items.map((n) => (
            <Card key={String(n.id)} style={styles.item}>
              <Card.Title title={n.titre || 'Notification'} subtitle={n.type_notification || ''} />
              <Card.Content>
                <Text variant="bodySmall">{n.message || ''}</Text>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontWeight: 'bold', color: '#1F2937' },
  subtitle: { color: '#6B7280', marginTop: 4 },
  list: { padding: 12, gap: 12 },
  item: { elevation: 1 },
  empty: { padding: 12, color: '#6B7280' },
});
