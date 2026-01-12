import { facturesAPI } from '@/src/services/api';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export function FacturesClientScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    try {
      const data = await facturesAPI.list();
      setItems(data?.results || data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Factures load error:', e);
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
          Factures
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {loading ? 'Chargement...' : `${items.length} facture(s)`}
        </Text>
      </View>

      <View style={styles.list}>
        {items.length === 0 && !loading ? (
          <Text style={styles.empty}>Aucune facture</Text>
        ) : (
          items.map((f) => (
            <Card key={String(f.id)} style={styles.item}>
              <Card.Title title={f.numero || 'Facture'} subtitle={f.statut || ''} />
              <Card.Content>
                <Text variant="bodySmall">Montant TTC: {f.montant_ttc ?? '-'} {f.devise || ''}</Text>
                <Text variant="bodySmall">Échéance: {f.date_echeance || '-'}</Text>
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
